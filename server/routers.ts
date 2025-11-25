import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getUserByOpenId,
  getUserById,
  updateUserProfile,
  createPublication,
  getPublicationByDoiAndUser,
  getUserPublications,
  getTopRankedUsers,
  getUserRating,
  searchUsers,
  searchPublications,
} from "./db";
import { hashPassword, verifyPassword, isValidEmail, isValidPassword } from "./auth";
import { isValidDoi, normalizeDoi, fetchCrossrefMetadata } from "./crossref";
import { triggerRankingRecalculation } from "./jobs";

export const appRouter = router({
  system: systemRouter,

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // USER PROFILE MANAGEMENT
  // ============================================================================
  user: router({
    /**
     * Get current user profile
     */
    getMe: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const rating = await getUserRating(user.id);

      return {
        ...user,
        rating,
      };
    }),

    /**
     * Update user profile
     */
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          field: z.string().optional(),
          institution: z.string().optional(),
          bio: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return await getUserById(ctx.user.id);
      }),

    /**
     * Get public user profile by ID
     */
    getPublicProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await getUserById(input.userId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const rating = await getUserRating(user.id);
        const publications = await getUserPublications(user.id, 100, 0);

        return {
          id: user.id,
          name: user.name,
          field: user.field,
          institution: user.institution,
          bio: user.bio,
          createdAt: user.createdAt,
          rating,
          publications,
        };
      }),
  }),

  // ============================================================================
  // PUBLICATIONS
  // ============================================================================
  publications: router({
    /**
     * Add a publication via DOI
     */
    add: protectedProcedure
      .input(
        z.object({
          doi: z.string().min(1, "DOI is required"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Validate DOI format
        if (!isValidDoi(input.doi)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid DOI format",
          });
        }

        const normalizedDoi = normalizeDoi(input.doi);

        // Check if publication already exists for this user
        const existing = await getPublicationByDoiAndUser(normalizedDoi, ctx.user.id);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This publication has already been added",
          });
        }

        // Fetch metadata from Crossref
        const metadata = await fetchCrossrefMetadata(normalizedDoi);
        if (!metadata) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Could not fetch publication metadata. Please verify the DOI is correct.",
          });
        }

        // Create publication record
        await createPublication({
          userId: ctx.user.id,
          doi: normalizedDoi,
          title: metadata.title,
          authors: metadata.authors,
          journal: metadata.journal,
          year: metadata.year,
          abstract: metadata.abstract,
          publicationType: metadata.publicationType as any,
        });

        return {
          success: true,
          publication: metadata,
        };
      }),

    /**
     * Get user's own publications
     */
    getMyPublications: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        const publications = await getUserPublications(ctx.user.id, input.limit, input.offset);
        return publications;
      }),

    /**
     * Get a user's publications (public)
     */
    getUserPublications: publicProcedure
      .input(
        z.object({
          userId: z.number(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getUserPublications(input.userId, input.limit, input.offset);
      }),
  }),

  // ============================================================================
  // RANKING & RATINGS
  // ============================================================================
  ranking: router({
    /**
     * Get top ranked users
     */
    getTopUsers: publicProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getTopRankedUsers(input.limit, input.offset);
      }),

    /**
     * Get a user's rating details
     */
    getUserRating: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const rating = await getUserRating(input.userId);
        if (!rating) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Rating not found",
          });
        }
        return rating;
      }),

    /**
     * Admin-only: Manually trigger ranking recalculation
     */
    recalculate: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can trigger ranking recalculation",
        });
      }

      try {
        await triggerRankingRecalculation();
        return { success: true, message: "Ranking recalculation triggered" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to trigger ranking recalculation",
        });
      }
    }),
  }),

  // ============================================================================
  // SEARCH
  // ============================================================================
  search: router({
    /**
     * Search for users and publications
     */
    query: publicProcedure
      .input(
        z.object({
          q: z.string().min(1, "Search query required"),
          type: z.enum(["users", "publications", "all"]).default("all"),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        const results: any = {};

        if (input.type === "users" || input.type === "all") {
          results.users = await searchUsers(input.q, input.limit, input.offset);
        }

        if (input.type === "publications" || input.type === "all") {
          results.publications = await searchPublications(input.q, input.limit, input.offset);
        }

        return results;
      }),
  }),
});

export type AppRouter = typeof appRouter;

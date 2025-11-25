import { eq, and, desc, asc, gte, lte, sql, ilike, or, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  publications,
  userRatings,
  publicationScores,
  rankingHistory,
  InsertPublication,
  InsertUserRating,
  InsertPublicationScore,
  InsertRankingHistory,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "field", "institution", "bio", "orcidId"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(
  userId: number,
  updates: {
    name?: string;
    field?: string;
    institution?: string;
    bio?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(updates).where(eq(users.id, userId));
}

// ============================================================================
// PUBLICATION MANAGEMENT
// ============================================================================

export async function createPublication(publication: InsertPublication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(publications).values(publication);
  return result;
}

export async function getPublicationByDoiAndUser(doi: string, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(publications)
    .where(and(eq(publications.doi, doi), eq(publications.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserPublications(userId: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(publications)
    .where(eq(publications.userId, userId))
    .orderBy(desc(publications.year), desc(publications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getPublicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(publications)
    .where(eq(publications.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function deletePublication(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(publications).where(eq(publications.id, id));
}

// ============================================================================
// RANKING & SCORING
// ============================================================================

export async function upsertUserRating(rating: InsertUserRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(userRatings)
    .values(rating)
    .onDuplicateKeyUpdate({
      set: {
        score: rating.score,
        rank: rating.rank,
        publicationCount: rating.publicationCount,
        computedAt: rating.computedAt,
      },
    });
}

export async function getUserRating(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userRatings)
    .where(eq(userRatings.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getTopRankedUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: users.id,
      name: users.name,
      field: users.field,
      institution: users.institution,
      score: userRatings.score,
      rank: userRatings.rank,
      publicationCount: userRatings.publicationCount,
    })
    .from(userRatings)
    .innerJoin(users, eq(userRatings.userId, users.id))
    .where(isNotNull(userRatings.rank))
    .orderBy(asc(userRatings.rank))
    .limit(limit)
    .offset(offset);
}

export async function getAllUsersForRanking() {
  const db = await getDb();
  if (!db) return [];

  return await db.select({ id: users.id }).from(users);
}

export async function createPublicationScore(score: InsertPublicationScore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(publicationScores).values(score);
}

export async function deletePublicationScoresForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(publicationScores).where(eq(publicationScores.userId, userId));
}

// ============================================================================
// RANKING HISTORY
// ============================================================================

export async function recordRankingHistory(history: InsertRankingHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(rankingHistory).values(history);
}

export async function getUserRankingHistory(userId: number, days = 90) {
  const db = await getDb();
  if (!db) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await db
    .select()
    .from(rankingHistory)
    .where(
      and(
        eq(rankingHistory.userId, userId),
        gte(rankingHistory.recordedAt, cutoffDate)
      )
    )
    .orderBy(asc(rankingHistory.recordedAt));
}

// ============================================================================
// SEARCH
// ============================================================================

export async function searchUsers(query: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  const searchTerm = `%${query}%`;

  return await db
    .select({
      id: users.id,
      name: users.name,
      field: users.field,
      institution: users.institution,
    })
    .from(users)
    .where(
      or(
        ilike(users.name, searchTerm),
        ilike(users.field, searchTerm),
        ilike(users.institution, searchTerm)
      )
    )
    .limit(limit)
    .offset(offset);
}

export async function searchPublications(query: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  const searchTerm = `%${query}%`;

  return await db
    .select()
    .from(publications)
    .where(
      or(
        ilike(publications.title, searchTerm),
        ilike(publications.journal, searchTerm),
        ilike(publications.doi, searchTerm)
      )
    )
    .orderBy(desc(publications.year))
    .limit(limit)
    .offset(offset);
}

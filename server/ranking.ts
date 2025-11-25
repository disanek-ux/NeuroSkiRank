import {
  getAllUsersForRanking,
  getUserPublications,
  upsertUserRating,
  createPublicationScore,
  deletePublicationScoresForUser,
  recordRankingHistory,
} from "./db";
import { isHighImpactJournal } from "./crossref";
import type { Publication } from "../drizzle/schema";

/**
 * Scoring formula for NeuroSciRank.
 * Each publication contributes points based on:
 * - Base score: 10 points per publication
 * - Recency bonus: varies by publication year
 * - Impact bonus: extra points for high-impact journals
 */

const CURRENT_YEAR = new Date().getFullYear();

interface PublicationScoreBreakdown {
  baseScore: number;
  recencyBonus: number;
  impactBonus: number;
  totalScore: number;
}

/**
 * Calculate recency bonus based on publication year.
 * Recent publications are weighted more heavily.
 */
function calculateRecencyBonus(year: number): number {
  const age = CURRENT_YEAR - year;

  if (age <= 1) {
    return 10; // Within last year
  } else if (age <= 3) {
    return 5; // Within last 3 years
  } else if (age <= 5) {
    return 2; // Within last 5 years
  } else {
    return 1; // Older publications
  }
}

/**
 * Calculate impact bonus based on journal.
 */
function calculateImpactBonus(journal: string): number {
  return isHighImpactJournal(journal) ? 5 : 0;
}

/**
 * Calculate score for a single publication.
 */
export function calculatePublicationScore(publication: Publication): PublicationScoreBreakdown {
  const baseScore = 10;
  const recencyBonus = calculateRecencyBonus(publication.year || CURRENT_YEAR);
  const impactBonus = calculateImpactBonus(publication.journal || "");
  const totalScore = baseScore + recencyBonus + impactBonus;

  return {
    baseScore,
    recencyBonus,
    impactBonus,
    totalScore,
  };
}

/**
 * Recalculate rankings for all users.
 * This is called weekly by the background job.
 */
export async function recalculateAllRankings(): Promise<void> {
  console.log("[Ranking] Starting ranking recalculation...");

  try {
    // Get all users
    const allUsers = await getAllUsersForRanking();

    if (!allUsers || allUsers.length === 0) {
      console.log("[Ranking] No users found");
      return;
    }

    // Calculate scores for each user
    const userScores: Array<{
      userId: number;
      score: number;
      publicationCount: number;
      scores: Array<{ publicationId: number; breakdown: PublicationScoreBreakdown }>;
    }> = [];

    for (const user of allUsers) {
      const publications = await getUserPublications(user.id, 1000, 0);

      let totalScore = 0;
      const scores: Array<{ publicationId: number; breakdown: PublicationScoreBreakdown }> = [];

      for (const pub of publications) {
        const breakdown = calculatePublicationScore(pub);
        totalScore += breakdown.totalScore;
        scores.push({ publicationId: pub.id, breakdown });
      }

      userScores.push({
        userId: user.id,
        score: totalScore,
        publicationCount: publications.length,
        scores,
      });
    }

    // Sort by score (descending), then by user ID (ascending) for tie-breaking
    userScores.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.userId - b.userId;
    });

    // Assign ranks and save ratings
    for (let i = 0; i < userScores.length; i++) {
      const userScore = userScores[i];
      const rank = i + 1;

      // Clear old publication scores for this user
      await deletePublicationScoresForUser(userScore.userId);

      // Save new publication scores
      for (const { publicationId, breakdown } of userScore.scores) {
        await createPublicationScore({
          publicationId,
          userId: userScore.userId,
          baseScore: breakdown.baseScore.toString(),
          recencyBonus: breakdown.recencyBonus.toString(),
          impactBonus: breakdown.impactBonus.toString(),
          totalScore: breakdown.totalScore.toString(),
          computedAt: new Date(),
        });
      }

      // Save user rating
      const now = new Date();
      await upsertUserRating({
        userId: userScore.userId,
        score: userScore.score.toString(),
        rank,
        publicationCount: userScore.publicationCount,
        computedAt: now,
        updatedAt: now,
      });

      // Record in history
      await recordRankingHistory({
        userId: userScore.userId,
        score: userScore.score.toString(),
        rank,
        publicationCount: userScore.publicationCount,
        recordedAt: now,
      });
    }

    console.log(`[Ranking] Successfully recalculated rankings for ${userScores.length} users`);
  } catch (error) {
    console.error("[Ranking] Error during ranking recalculation:", error);
    throw error;
  }
}

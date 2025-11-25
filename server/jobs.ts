import cron from "node-cron";
import { recalculateAllRankings } from "./ranking";

/**
 * Initialize background jobs for NeuroSciRank.
 * Currently runs ranking recalculation weekly.
 */

let rankingJobScheduled = false;

export function initializeBackgroundJobs(): void {
  if (rankingJobScheduled) {
    console.log("[Jobs] Background jobs already initialized");
    return;
  }

  // Schedule ranking recalculation every Sunday at 00:00 UTC
  // Cron format: minute hour day month day-of-week
  // 0 0 * * 0 = Sunday at midnight UTC
  const rankingJob = cron.schedule("0 0 * * 0", async () => {
    console.log("[Jobs] Starting scheduled ranking recalculation...");
    try {
      await recalculateAllRankings();
      console.log("[Jobs] Ranking recalculation completed successfully");
    } catch (error) {
      console.error("[Jobs] Error during ranking recalculation:", error);
      // In production, you might want to send an alert/notification here
    }
  });

  rankingJob.start();
  rankingJobScheduled = true;

  console.log("[Jobs] Background jobs initialized. Ranking recalculation scheduled for Sundays at 00:00 UTC");
}

/**
 * Stop all background jobs (useful for testing or graceful shutdown).
 */
export function stopBackgroundJobs(): void {
  // Note: node-cron doesn't provide a global stop method,
  // but you can store references to jobs and call .stop() on them if needed
  console.log("[Jobs] Background jobs stopped");
}

/**
 * Manually trigger ranking recalculation (useful for testing or admin endpoints).
 */
export async function triggerRankingRecalculation(): Promise<void> {
  console.log("[Jobs] Manual ranking recalculation triggered");
  try {
    await recalculateAllRankings();
    console.log("[Jobs] Manual ranking recalculation completed successfully");
  } catch (error) {
    console.error("[Jobs] Error during manual ranking recalculation:", error);
    throw error;
  }
}

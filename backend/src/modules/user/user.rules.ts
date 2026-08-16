import type { UserSeriesStatus } from "@/generated/prisma/client.js";

export function getUserSeriesStatus(
  watchedEpisodeCount: number,
  watchCount: number,
  numberOfEpisodes: number,
  inProduction: boolean
): UserSeriesStatus {
  if (watchedEpisodeCount === 0) {
    return "PLANNED";
  }

  if (numberOfEpisodes > 0 && watchCount >= numberOfEpisodes) {
    return inProduction ? "PAUSED" : "COMPLETED";
  }

  return "WATCHING";
}

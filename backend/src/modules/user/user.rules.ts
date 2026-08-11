import type { UserSeries, UserSeriesStatus } from "@/generated/prisma/client.js";
import { userRepository } from "@/modules/user/user.repository.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";

export function getStatusAfterAddingEpisodes(
  watchCount: number,
  numberOfEpisodes: number
): UserSeriesStatus {
  return watchCount >= numberOfEpisodes ? "COMPLETED" : "WATCHING";
}

export function getStatusAfterRemovingEpisodes(watchCount: number): UserSeriesStatus {
  return watchCount === 0 ? "PLANNED" : "WATCHING";
}

export async function updateSeriesStatus(userSeries: UserSeries, status: UserSeriesStatus, tx: PrismaTx) {
  if (status === userSeries.status) {
    return userSeries;
  }

  return userRepository.updateSeries(
    {
      userId_seriesId: {
        userId: userSeries.userId,
        seriesId: userSeries.seriesId
      }
    },
    { status },
    tx
  );
}
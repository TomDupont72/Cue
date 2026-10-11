import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";

export async function listUserSeriesWithDetails(
  userId: string,
  seriesId?: number,
  db: PrismaTx = prisma
) {
  return db.userSeries.findMany({
    include: {
      series: {
        include: {
          providers: {
            include: { provider: true },
            orderBy: { provider: { displayPriority: "asc" } }
          },
          genres: { include: { genre: true }, orderBy: { genre: { name: "asc" } } }
        }
      }
    },
    where: { userId, seriesId },
    orderBy: { lastWatchedAt: "desc" }
  });
}

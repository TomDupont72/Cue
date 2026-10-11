import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";

export async function listGroupedEpisodesBySeries(
  userId: string,
  date: Date,
  db: PrismaTx = prisma
) {
  const rows = await db.series.findMany({
    where: { users: { some: { userId, status: { in: ["WATCHING", "DROPPED"] } } } },
    include: {
      episodes: {
        where: { seasonNumber: { not: 0 }, airDate: { lt: date } },
        include: { users: { where: { userId } } },
        orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }]
      },
      users: { where: { userId } }
    }
  });

  return rows.sort(
    (a, b) =>
      (b.users[0].lastWatchedAt ?? new Date()).getTime() -
      (a.users[0].lastWatchedAt ?? new Date()).getTime()
  );
}

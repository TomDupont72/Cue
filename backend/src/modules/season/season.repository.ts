import type { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";

export const seasonRepository = {
  async createMany(
    seriesId: number,
    data: Omit<Prisma.SeasonUncheckedCreateInput, "seriesId">[],
    db: PrismaTx = prisma
  ) {
    await db.season.createMany({
      data: data.map((season) => ({ ...season, seriesId })),
      skipDuplicates: true
    });

    return db.season.findMany({
      where: {
        tmdbId: { in: data.map((season) => season.tmdbId) }
      }
    });
  }
};

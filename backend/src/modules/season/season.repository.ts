import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { createManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export const seasonRepository = {
  async createMany(
    seriesId: number,
    data: Omit<Prisma.SeasonUncheckedCreateInput, "seriesId">[],
    db: PrismaTx = prisma
  ) {
    return createManyAndFetch({
      data: data.map((season) => ({ ...season, seriesId })),
      scalarFields: Prisma.SeasonScalarFieldEnum,
      uniqueBy: "tmdbId",
      delegate: db.season
    });
  }
};

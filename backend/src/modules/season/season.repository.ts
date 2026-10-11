import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export const seasonRepository = {
  async upsertMany(data: readonly Prisma.SeasonUncheckedCreateInput[], db: PrismaTx = prisma) {
    return upsertManyAndFetch({
      data,
      scalarFields: Prisma.SeasonScalarFieldEnum,
      uniqueBy: "tmdbId",
      delegate: db.season
    });
  },

  async listBySeriesId(seriesId: number, db: PrismaTx = prisma) {
    return db.season.findMany({ where: { seriesId } });
  }
};

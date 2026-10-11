import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export const providerRepository = {
  async upsertMany(data: readonly Prisma.ProviderCreateManyInput[], db: PrismaTx = prisma) {
    return upsertManyAndFetch({
      data,
      scalarFields: Prisma.ProviderScalarFieldEnum,
      uniqueBy: "tmdbId",
      delegate: db.provider
    });
  },

  async listBySeriesId(seriesId: number, db: PrismaTx = prisma) {
    return db.provider.findMany({
      where: { series: { some: { seriesId } } },
      orderBy: { displayPriority: "asc" }
    });
  }
};

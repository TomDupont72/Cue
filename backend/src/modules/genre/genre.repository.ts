import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export const genreRepository = {
  async upsertMany(data: readonly Prisma.GenreCreateManyInput[], db: PrismaTx = prisma) {
    return upsertManyAndFetch({
      data,
      scalarFields: Prisma.GenreScalarFieldEnum,
      uniqueBy: "tmdbId",
      delegate: db.genre
    });
  },

  async listBySeriesId(seriesId: number, db: PrismaTx = prisma) {
    return db.genre.findMany({
      where: { series: { some: { seriesId } } },
      orderBy: { name: "asc" }
    });
  }
};

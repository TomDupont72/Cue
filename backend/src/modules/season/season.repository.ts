import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { SelectQuery } from "@/shared/db/selectQuery.js";
import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export const seasonsSelectQuery = (db: PrismaTx = prisma) =>
  new SelectQuery<typeof db.season>(db.season, "SEASON_NOT_FOUND");

export const seasonRepository = {
  findMany(where: Prisma.SeasonWhereInput, db: PrismaTx = prisma) {
    return db.season.findMany({
      where
    });
  },

  async upsertMany(
    seriesId: number,
    data: Omit<Prisma.SeasonUncheckedCreateInput, "seriesId">[],
    db: PrismaTx = prisma
  ) {
    return upsertManyAndFetch({
      data: data.map((season) => ({ ...season, seriesId })),
      scalarFields: Prisma.SeasonScalarFieldEnum,
      uniqueBy: "tmdbId",
      delegate: db.season
    });
  }
};

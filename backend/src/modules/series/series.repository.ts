import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import type { Prisma } from "@/generated/prisma/client.js";

export const seriesRepository = {
  findOne(where: Prisma.SeriesWhereUniqueInput, db: PrismaTx = prisma) {
    return db.series.findUnique({
      where
    });
  },

  upsert(
    where: Prisma.SeriesWhereUniqueInput,
    data: Prisma.SeriesCreateInput,
    db: PrismaTx = prisma
  ) {
    return db.series.upsert({
      where,
      create: data,
      update: data
    });
  },

  async addGenres(seriesId: number, genreIds: number[], db: PrismaTx = prisma) {
    await db.seriesGenre.createMany({
      data: genreIds.map((genreId) => ({
        seriesId,
        genreId
      })),
      skipDuplicates: true
    });
  },

  async addNetworks(seriesId: number, networkIds: number[], db: PrismaTx = prisma) {
    await db.seriesNetwork.createMany({
      data: networkIds.map((networkId) => ({
        seriesId,
        networkId
      })),
      skipDuplicates: true
    });
  },

  async addPeople(seriesId: number, peopleIds: number[], db: PrismaTx = prisma) {
    await db.seriesPeople.createMany({
      data: peopleIds.map((peopleId) => ({ seriesId, peopleId })),
      skipDuplicates: true
    });
  }
};

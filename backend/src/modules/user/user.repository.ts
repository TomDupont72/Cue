import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";
import { findManyPaginated } from "@/shared/utils/prisma/prisma.js";

export const userRepository = {
  findOneSeries(where: Prisma.UserSeriesWhereUniqueInput, db: PrismaTx = prisma) {
    return db.userSeries.findUnique({
      where
    });
  },

  findManySeries(
    where: Prisma.UserSeriesWhereInput,
    limit: number,
    cursor: string | undefined,
    db: PrismaTx = prisma
  ) {
    return findManyPaginated({
      where,
      limit,
      cursor: cursor ? new Date(cursor) : undefined,
      cursorField: "lastWatchedAt",
      order: "desc",
      delegate: db.userSeries
    });
  },

  findManyEpisodes(where: Prisma.UserEpisodeWhereInput, db: PrismaTx = prisma) {
    return db.userEpisode.findMany({
      where
    });
  },

  upsertSeries(
    where: Prisma.UserSeriesWhereUniqueInput,
    data: Prisma.UserSeriesUncheckedCreateInput,
    db: PrismaTx = prisma
  ) {
    return db.userSeries.upsert({
      where,
      create: data,
      update: data
    });
  },

  upsertEpisode(
    where: Prisma.UserEpisodeWhereUniqueInput,
    data: Prisma.UserEpisodeUncheckedCreateInput,
    db: PrismaTx = prisma
  ) {
    return db.userEpisode.upsert({
      where,
      create: data,
      update: data
    });
  }
};

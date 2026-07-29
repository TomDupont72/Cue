import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";
import { deleteManyAndFetch, findManyPaginated } from "@/shared/utils/prisma/prisma.js";
import { DashboardSummaryRow } from "./user.types.js";

export const userRepository = {
  findOneSeries(where: Prisma.UserSeriesWhereUniqueInput, db: PrismaTx = prisma) {
    return db.userSeries.findUnique({
      where
    });
  },

  findOneEpisode(where: Prisma.UserEpisodeWhereUniqueInput, db: PrismaTx = prisma) {
    return db.userEpisode.findUnique({
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
    create: Prisma.UserSeriesUncheckedCreateInput,
    update: Prisma.UserSeriesUncheckedUpdateInput,
    db: PrismaTx = prisma
  ) {
    return db.userSeries.upsert({
      where,
      create: create,
      update: update
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
  },

  deleteManyEpisode(where: Prisma.UserEpisodeWhereInput, db: PrismaTx = prisma) {
    return deleteManyAndFetch({
      where,
      delegate: db.userEpisode
    });
  },

  async getDashboardSummary(userId: string, db: PrismaTx = prisma) {
    const [summary] = await db.$queryRaw<DashboardSummaryRow[]>`
        SELECT SUM(e.runtime) AS "totalWatchedMinutes", COUNT(e.id) AS "totalWatchedEpisodes" FROM "Episode" e
        INNER JOIN "UserEpisode" ue 
        ON ue."episodeId" = e.id
        WHERE ue."userId" = ${userId};
    `;

    return {
      totalWatchedMinutes: Number(summary.totalWatchedMinutes),
      totalWatchedEpisodes: Number(summary.totalWatchedEpisodes)
    };
  }
};

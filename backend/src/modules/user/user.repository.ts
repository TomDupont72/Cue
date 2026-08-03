import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";
import {
  deleteManyAndFetch,
  findManyPaginated,
  upsertManyAndFetch
} from "@/shared/utils/prisma/prisma.js";
import { DashboardSummaryEpisodesRow, DashboardSummarySeriesRow } from "./user.types.js";

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

  upsertManyEpisodes(data: Prisma.UserEpisodeCreateManyInput[], db: PrismaTx = prisma) {
    return upsertManyAndFetch({
      data,
      scalarFields: Prisma.UserEpisodeScalarFieldEnum,
      uniqueBy: ["userId", "episodeId"] as const,
      delegate: db.userEpisode
    });
  },

  deleteManyEpisode(where: Prisma.UserEpisodeWhereInput, db: PrismaTx = prisma) {
    return deleteManyAndFetch({
      where,
      delegate: db.userEpisode
    });
  },

  async getDashboardSummary(userId: string, db: PrismaTx = prisma) {
    const [summaryEpisodes] = await db.$queryRaw<DashboardSummaryEpisodesRow[]>`
        SELECT SUM(e.runtime) AS "totalWatchedMinutes", COUNT(e.id) AS "totalWatchedEpisodes" FROM "Episode" e
        INNER JOIN "UserEpisode" ue         
        ON ue."episodeId" = e.id
        WHERE ue."userId" = ${userId};
    `;

    const [summarySeries] = await db.$queryRaw<DashboardSummarySeriesRow[]>`
        SELECT COUNT(us."seriesId") AS "totalWatchedSeries" FROM "UserSeries" us
        WHERE us."userId"= ${userId}
        AND us.status = 'COMPLETED';
    `;

    return {
      totalWatchedMinutes: Number(summaryEpisodes.totalWatchedMinutes),
      totalWatchedEpisodes: Number(summaryEpisodes.totalWatchedEpisodes),
      totalWatchedSeries: Number(summarySeries.totalWatchedSeries)
    };
  }
};

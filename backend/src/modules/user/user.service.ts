import { prisma } from "@/shared/db/prisma.js";
import {
  userEpisodeAggregateQuery,
  userEpisodeInsertQuery,
  userEpisodeSelectQuery,
  userRepository,
  userSeriesAggregateQuery,
  userSeriesSelectQuery,
  userSeriesUpdateQuery,
  userSeriesUpsertQuery
} from "@/modules/user/user.repository.js";
import {
  UserEpisodePostParams,
  UserSeriesPostBody,
  UserSeriesPostParams,
  UserEpisodeDeleteParams,
  UserSeriesGet,
  UserSeasonPostParams,
  UserSeasonDeleteParams,
  UserSeriesReconcilePostParams
} from "@/modules/user/user.schemas.js";
import { episodeSelectQuery } from "@/modules/episode/episode.repository.js";
import { notFound } from "@/shared/errors/errors.helpers.js";
import {
  seriesRepository,
  seriesSelectQuery,
  seriesUpsertQuery
} from "@/modules/series/series.repository.js";
import { getUserSeriesStatus } from "@/modules/user/user.rules.js";
import { getEpisodeReleaseCutoff } from "@/modules/episode/episode.utils.js";
import { episodeTable } from "@/shared/db/constants/aggregateTables.js";
import { coalesce, count, sum } from "@/shared/db/aggregateExpressions.js";

export const userService = {
  async seriesGet(userId: string, params: UserSeriesGet) {
    const { seriesId, status, limit, cursor } = params;
    const cursorField = status === undefined || status === "PLANNED" ? "addedAt" : "lastWatchedAt";

    const userSeries = await userRepository.findManySeries(
      { userId, seriesId, status },
      limit,
      cursor,
      cursorField
    );

    const seriesDetails = await seriesRepository.findMany({
      id: { in: userSeries.items.map((series) => series.seriesId) }
    });

    const seriesById = new Map(seriesDetails.map((series) => [series.id, series]));

    const items = userSeries.items
      .map((series) => {
        const seriesDetails = seriesById.get(series.seriesId);

        return {
          ...series,
          seriesDetails
        };
      })
      .filter((item) => item !== null);

    return {
      items: items,
      hasNextPage: userSeries.hasNextPage,
      nextCursor: userSeries.nextCursor
    };
  },

  async episodeFeedGet(userId: string) {
    const episodes = await userRepository.getEpisodesFeed(userId);

    return {
      WATCHING: episodes.filter(({ status }) => status === "WATCHING"),
      PAUSED: episodes.filter(({ status }) => status === "PAUSED"),
      DROPPED: episodes.filter(({ status }) => status === "DROPPED")
    };
  },

  async episodeUpcomingGet(userId: string, now = new Date()) {
    const episodes = await userRepository.getEpisodesUpcoming(userId, now);

    return {
      episodes
    };
  },

  async seriesPost(
    userId: string,
    params: UserSeriesPostParams,
    body: UserSeriesPostBody,
    now = new Date()
  ) {
    await seriesSelectQuery().where({ id: params.seriesId }).emptyThrow().first();

    return userSeriesUpsertQuery()
      .where({ userId_seriesId: { userId, ...params } })
      .create({ userId, ...params, ...body, addedAt: now })
      .update(body)
      .first();
  },

  async episodePost(userId: string, params: UserEpisodePostParams, now = new Date()) {
    const { seriesId, episodeId } = params;
    const releaseCutoff = getEpisodeReleaseCutoff(now);

    return prisma.$transaction(async (tx) => {
      const series = await seriesSelectQuery(tx).where({ id: seriesId }).emptyThrow().first();

      const episode = await episodeSelectQuery(tx)
        .where({ id: episodeId, seriesId, airDate: { lt: releaseCutoff } })
        .emptyThrow()
        .first();

      const createdUserEpisode = await userEpisodeInsertQuery(tx)
        .value({ userId, episodeId, watchedAt: now })
        .skipDuplicates()
        .first();

      if (createdUserEpisode) {
        const watchCountIncrement = episode.seasonNumber === 0 ? 0 : 1;

        const userSeries = await userSeriesUpsertQuery(tx)
          .where({ userId_seriesId: { userId, seriesId } })
          .create({
            userId,
            seriesId,
            watchCount: watchCountIncrement,
            watchedEpisodeCount: 1,
            lastWatchedAt: now
          })
          .update({
            watchCount: { increment: watchCountIncrement },
            watchedEpisodeCount: { increment: 1 },
            lastWatchedAt: now
          })
          .first();

        const status = getUserSeriesStatus(
          userSeries.watchedEpisodeCount,
          userSeries.watchCount,
          series.numberOfEpisodes,
          series.inProduction
        );

        if (status !== userSeries.status) {
          await userSeriesUpdateQuery(tx).where({ userId, seriesId }).set({ status }).all();
        }

        return createdUserEpisode;
      }

      return userEpisodeSelectQuery(tx).where({ userId, episodeId }).emptyThrow().first();
    });
  },

  async episodeDelete(userId: string, params: UserEpisodeDeleteParams) {
    const { seriesId, episodeId } = params;

    return prisma.$transaction(async (tx) => {
      const episode = await episodeSelectQuery(tx)
        .where({ id: episodeId, seriesId })
        .emptyThrow()
        .first();

      const series = await seriesSelectQuery(tx).where({ id: seriesId }).emptyThrow().first();

      await userSeriesSelectQuery(tx).where({ userId, seriesId }).emptyThrow().first();

      const [deletedUserEpisode] = await userRepository.deleteEpisodes(userId, [episodeId], tx);

      if (deletedUserEpisode) {
        const watchCountDecrement = episode.seasonNumber === 0 ? 0 : 1;

        const updatedUserSeries = await userRepository.updateSeries(
          {
            userId_seriesId: {
              userId,
              seriesId
            }
          },
          {
            watchCount: {
              decrement: watchCountDecrement
            },
            watchedEpisodeCount: {
              decrement: 1
            }
          },
          tx
        );

        const status = getUserSeriesStatus(
          updatedUserSeries.watchedEpisodeCount,
          updatedUserSeries.watchCount,
          series.numberOfEpisodes,
          series.inProduction
        );

        const latestWatchedEpisode = await userEpisodeSelectQuery(tx)
          .where({ userId, episode: { seriesId } })
          .orderBy({ watchedAt: "desc" })
          .first();

        await userRepository.updateSeries(
          {
            userId_seriesId: {
              userId,
              seriesId
            }
          },
          {
            status,
            lastWatchedAt: latestWatchedEpisode?.watchedAt ?? null
          },
          tx
        );

        return deletedUserEpisode;
      }

      throw notFound("USER_EPISODE_NOT_FOUND", "Episode for this user not found");
    });
  },

  async seasonPost(userId: string, params: UserSeasonPostParams, now = new Date()) {
    const { seriesId, seasonId } = params;
    const releaseCutoff = getEpisodeReleaseCutoff(now);

    return prisma.$transaction(async (tx) => {
      const episodes = await episodeSelectQuery(tx)
        .where({ seriesId, seasonId, airDate: { lt: releaseCutoff } })
        .emptyThrow()
        .all();

      const series = await seriesSelectQuery(tx).where({ id: seriesId }).emptyThrow().first();

      const createdUserEpisodes = await userRepository.createManyEpisodes(
        episodes.map((episode) => ({ userId, episodeId: episode.id, watchedAt: now })),
        tx
      );

      if (createdUserEpisodes.length === 0) {
        return userEpisodeSelectQuery(tx)
          .where({ userId, episodeId: { in: episodes.map((episode) => episode.id) } })
          .all();
      }

      const regularEpisodeIds = new Set(
        episodes.filter((episode) => episode.seasonNumber !== 0).map((episode) => episode.id)
      );
      const watchCountIncrement = createdUserEpisodes.filter((episode) =>
        regularEpisodeIds.has(episode.episodeId)
      ).length;

      const userSeries = await userRepository.upsertSeries(
        {
          userId_seriesId: {
            userId,
            seriesId
          }
        },
        {
          userId,
          seriesId,
          watchCount: watchCountIncrement,
          watchedEpisodeCount: createdUserEpisodes.length,
          lastWatchedAt: now
        },
        {
          watchCount: {
            increment: watchCountIncrement
          },
          watchedEpisodeCount: {
            increment: createdUserEpisodes.length
          },
          lastWatchedAt: now
        },
        tx
      );

      const status = getUserSeriesStatus(
        userSeries.watchedEpisodeCount,
        userSeries.watchCount,
        series.numberOfEpisodes,
        series.inProduction
      );

      if (status !== userSeries.status) {
        await userRepository.updateSeries(
          {
            userId_seriesId: {
              userId,
              seriesId
            }
          },
          { status },
          tx
        );
      }

      return userEpisodeSelectQuery(tx)
        .where({ userId, episodeId: { in: episodes.map((episode) => episode.id) } })
        .all();
    });
  },

  async seasonDelete(userId: string, params: UserSeasonDeleteParams) {
    const { seriesId, seasonId } = params;

    return prisma.$transaction(async (tx) => {
      const episodes = await episodeSelectQuery(tx)
        .where({ seriesId, seasonId })
        .emptyThrow()
        .all();

      const series = await seriesSelectQuery(tx).where({ id: seriesId }).emptyThrow().first();

      await userSeriesSelectQuery(tx).where({ userId, seriesId }).emptyThrow().first();

      const deletedUserEpisodes = await userRepository.deleteEpisodes(
        userId,
        episodes.map((episode) => episode.id),
        tx
      );

      if (deletedUserEpisodes.length === 0) {
        throw notFound("USER_EPISODE_NOT_FOUND", "Episode for this user not found");
      }

      const regularEpisodeIds = new Set(
        episodes.filter((episode) => episode.seasonNumber !== 0).map((episode) => episode.id)
      );
      const watchCountDecrement = deletedUserEpisodes.filter((episode) =>
        regularEpisodeIds.has(episode.episodeId)
      ).length;

      const updatedUserSeries = await userRepository.updateSeries(
        {
          userId_seriesId: {
            userId,
            seriesId
          }
        },
        {
          watchCount: {
            decrement: watchCountDecrement
          },
          watchedEpisodeCount: {
            decrement: deletedUserEpisodes.length
          }
        },
        tx
      );

      const status = getUserSeriesStatus(
        updatedUserSeries.watchedEpisodeCount,
        updatedUserSeries.watchCount,
        series.numberOfEpisodes,
        series.inProduction
      );

      const latestWatchedEpisode = await userEpisodeSelectQuery(tx)
        .where({ userId, episode: { seriesId } })
        .orderBy({ watchedAt: "desc" })
        .first();

      await userRepository.updateSeries(
        {
          userId_seriesId: {
            userId,
            seriesId
          }
        },
        {
          status,
          lastWatchedAt: latestWatchedEpisode?.watchedAt ?? null
        },
        tx
      );

      return deletedUserEpisodes;
    });
  },

  async dashboardSummaryGet(userId: string) {
    const summaryEpisodes = await userEpisodeAggregateQuery()
      .join(episodeTable)
      .select({
        totalWatchedMinutes: coalesce(sum(episodeTable.runtime), 0),
        totalWatchedEpisodes: count(episodeTable.id)
      })
      .where({ userId })
      .first();

    const summarySeries = await userSeriesAggregateQuery()
      .select({ totalWatchedSeries: count() })
      .where({ userId, status: "COMPLETED" })
      .first();

    return { ...summaryEpisodes, ...summarySeries };
  },

  async seriesReconcilePost(params: UserSeriesReconcilePostParams, now = new Date()) {
    const inactiveSince = new Date(now);
    inactiveSince.setUTCDate(inactiveSince.getUTCDate() - 60);

    return prisma.$transaction(async (tx) => {
      const seriesProgress = await userRepository.getSeriesProgress(params.userId, tx);
      const progressBySeriesId = new Map(
        seriesProgress.map((progress) => [progress.seriesId, progress])
      );

      const userSeries = await tx.userSeries.findMany({
        where: {
          userId: params.userId
        },
        include: {
          series: {
            select: {
              numberOfEpisodes: true,
              inProduction: true
            }
          }
        }
      });

      const updates = userSeries.flatMap((item) => {
        const progress = progressBySeriesId.get(item.seriesId);
        const watchedEpisodeCount = progress?.watchedEpisodeCount ?? 0;
        const watchCount = progress?.watchCount ?? 0;
        const lastWatchedAt = progress?.lastWatchedAt ?? null;
        const calculatedStatus = getUserSeriesStatus(
          watchedEpisodeCount,
          watchCount,
          item.series.numberOfEpisodes,
          item.series.inProduction
        );
        const status =
          item.status === "DROPPED" && calculatedStatus !== "PLANNED"
            ? "DROPPED"
            : item.status === "WATCHING" &&
                calculatedStatus === "WATCHING" &&
                lastWatchedAt !== null &&
                lastWatchedAt <= inactiveSince
              ? "DROPPED"
              : calculatedStatus;

        const hasChanged =
          item.watchedEpisodeCount !== watchedEpisodeCount ||
          item.watchCount !== watchCount ||
          (item.lastWatchedAt?.getTime() ?? null) !== (lastWatchedAt?.getTime() ?? null) ||
          item.status !== status;

        return !hasChanged
          ? []
          : [
              userRepository.updateSeries(
                {
                  userId_seriesId: {
                    userId: item.userId,
                    seriesId: item.seriesId
                  }
                },
                {
                  watchedEpisodeCount,
                  watchCount,
                  lastWatchedAt,
                  status
                },
                tx
              )
            ];
      });

      await Promise.all(updates);

      return {
        updatedCount: updates.length
      };
    });
  }
};

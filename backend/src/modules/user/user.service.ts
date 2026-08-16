import { prisma } from "@/shared/db/prisma.js";
import { userRepository } from "@/modules/user/user.repository.js";
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
import { episodeRepository } from "@/modules/episode/episode.repository.js";
import { notFound } from "@/shared/errors/errors.helpers.js";
import { seriesRepository } from "@/modules/series/series.repository.js";
import { getUserSeriesStatus } from "@/modules/user/user.rules.js";
import { getEpisodeReleaseCutoff } from "@/modules/episode/episode.utils.js";

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

  async seriesPost(userId: string, params: UserSeriesPostParams, body: UserSeriesPostBody) {
    const userSeries = await userRepository.upsertSeries(
      { userId_seriesId: { userId, ...params } },
      { userId, ...params, ...body },
      { ...body }
    );

    return userSeries;
  },

  async episodePost(userId: string, params: UserEpisodePostParams, now = new Date()) {
    const { seriesId, episodeId } = params;

    return prisma.$transaction(async (tx) => {
      const episode = await episodeRepository.findOne(
        {
          id: episodeId,
          seriesId,
          airDate: {
            lt: getEpisodeReleaseCutoff(now)
          }
        },
        tx
      );

      if (!episode) {
        throw notFound("Episode");
      }

      const series = await seriesRepository.findOne({ id: seriesId }, tx);

      if (!series) {
        throw notFound("Series");
      }

      const [createdUserEpisode] = await userRepository.createManyEpisodes(
        [{ userId, episodeId, watchedAt: now }],
        tx
      );

      if (createdUserEpisode) {
        const watchCountIncrement = episode.seasonNumber === 0 ? 0 : 1;

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
            watchedEpisodeCount: 1,
            lastWatchedAt: now
          },
          {
            watchCount: {
              increment: watchCountIncrement
            },
            watchedEpisodeCount: {
              increment: 1
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

        const nextEpisode = await userRepository.getEpisodeFeedItem(userId, seriesId, tx);

        return {
          ...createdUserEpisode,
          seriesId,
          nextEpisode
        };
      }

      const existingUserEpisode = await userRepository.findOneEpisode(
        { userId_episodeId: { userId, episodeId } },
        tx
      );

      if (!existingUserEpisode) {
        throw notFound("Episode for this user");
      }

      const nextEpisode = await userRepository.getEpisodeFeedItem(userId, seriesId, tx);

      return {
        ...existingUserEpisode,
        seriesId,
        nextEpisode
      };
    });
  },

  async episodeDelete(userId: string, params: UserEpisodeDeleteParams) {
    const { seriesId, episodeId } = params;

    return prisma.$transaction(async (tx) => {
      const episode = await episodeRepository.findOne({ id: episodeId, seriesId }, tx);

      if (!episode) {
        throw notFound("Episode");
      }

      const series = await seriesRepository.findOne({ id: seriesId }, tx);

      if (!series) {
        throw notFound("Series");
      }

      const userSeries = await userRepository.findOneSeries(
        { userId_seriesId: { userId: userId, seriesId: seriesId } },
        tx
      );

      if (!userSeries) {
        throw notFound("Series for this user");
      }

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

        const latestWatchedEpisode = await userRepository.findLatestWatchedEpisode(
          userId,
          seriesId,
          tx
        );

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

      throw notFound("Episode for this user");
    });
  },

  async seasonPost(userId: string, params: UserSeasonPostParams, now = new Date()) {
    const { seriesId, seasonId } = params;

    return prisma.$transaction(async (tx) => {
      const episodes = await episodeRepository.findMany(
        {
          seriesId,
          seasonId,
          airDate: {
            lt: getEpisodeReleaseCutoff(now)
          }
        },
        tx
      );

      if (episodes.length === 0) {
        throw notFound("Episodes");
      }

      const series = await seriesRepository.findOne({ id: seriesId }, tx);

      if (!series) {
        throw notFound("Series");
      }

      const createdUserEpisodes = await userRepository.createManyEpisodes(
        episodes.map((episode) => ({ userId, episodeId: episode.id, watchedAt: now })),
        tx
      );

      if (createdUserEpisodes.length === 0) {
        return userRepository.findManyEpisodes(
          { userId, episodeId: { in: episodes.map((episode) => episode.id) } },
          tx
        );
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

      return createdUserEpisodes;
    });
  },

  async seasonDelete(userId: string, params: UserSeasonDeleteParams) {
    const { seriesId, seasonId } = params;

    return prisma.$transaction(async (tx) => {
      const episodes = await episodeRepository.findMany({ seriesId, seasonId }, tx);

      if (episodes.length === 0) {
        throw notFound("Episodes");
      }

      const series = await seriesRepository.findOne({ id: seriesId }, tx);

      if (!series) {
        throw notFound("Series");
      }

      const userSeries = await userRepository.findOneSeries(
        { userId_seriesId: { userId: userId, seriesId: seriesId } },
        tx
      );

      if (!userSeries) {
        throw notFound("Series for this user");
      }

      const deletedUserEpisodes = await userRepository.deleteEpisodes(
        userId,
        episodes.map((episode) => episode.id),
        tx
      );

      if (deletedUserEpisodes.length === 0) {
        throw notFound("Episode for this user");
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

      const latestWatchedEpisode = await userRepository.findLatestWatchedEpisode(
        userId,
        seriesId,
        tx
      );

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
    const summary = await userRepository.getDashboardSummary(userId);

    return summary;
  },

  async seriesReconcilePost(params: UserSeriesReconcilePostParams, now = new Date()) {
    const inactiveSince = new Date(now);
    inactiveSince.setUTCMonth(inactiveSince.getUTCMonth() - 2);

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

import { episodeRepository } from "@/modules/episode/episode.repository.js";
import { getEpisodeReleaseCutoff } from "@/modules/episode/episode.utils.js";
import { seriesRepository } from "@/modules/series/series.repository.js";
import { getUserDashboardSummary } from "@/modules/user/queries/getUserDashboardSummary.query.js";
import { getUserSeriesReconciliation } from "@/modules/user/queries/getUserSeriesReconciliation.query.js";
import { listGroupedEpisodesBySeries } from "@/modules/user/queries/listGroupedEpisodesBySeries.query.js";
import { listUserSeriesWithDetails } from "@/modules/user/queries/listUserSeriesWithDetails.query.js";
import { listUserUpcomingEpisodes } from "@/modules/user/queries/listUserUpcomingEpisodes.query.js";
import { userEpisodeRepository, userSeriesRepository } from "@/modules/user/user.repository.js";
import { getUserSeriesStatus } from "@/modules/user/user.rules.js";
import {
  UserEpisodePostParams,
  UserSeriesPostBody,
  UserSeriesPostParams,
  UserEpisodeDeleteParams,
  UserSeriesGetParams,
  UserSeasonPostParams,
  UserSeasonDeleteParams,
  UserSeriesReconcilePostParams
} from "@/modules/user/user.schemas.js";
import { prisma } from "@/shared/db/prisma.js";
import { notFound } from "@/shared/errors/errors.helpers.js";

export const userService = {
  async seriesGet(userId: string, params: UserSeriesGetParams, now = new Date()) {
    const { seriesId } = params;

    const rows = await listUserSeriesWithDetails(userId, now, seriesId);
    const userSeriesDetails = rows.map((row) => {
      const { series, ...userSeries } = row;
      const { providers, genres, ...seriesDetails } = series;

      return {
        ...userSeries,
        seriesDetails,
        seriesProviders: providers.map((provider) => provider.provider),
        seriesGenres: genres.map((genre) => genre.genre)
      };
    });

    return {
      series: userSeriesDetails
    };
  },

  async episodeFeedGet(userId: string, now = new Date()) {
    const episodesBySeries = await listGroupedEpisodesBySeries(userId, now);

    const upcommingEpisodes = [];

    for (const episodesBySerie of episodesBySeries) {
      const indexByWatchedAt: Map<number, Date> = new Map();
      const episodes = episodesBySerie.episodes;

      for (let i = 0; i < episodesBySerie.episodes.length; i++) {
        const episode = episodes[i];
        if (episode.users.length !== 0) {
          indexByWatchedAt.set(i, episode.users[0].watchedAt);
        }
      }
      const indexByWatchedAtSorted = new Map(
        [...indexByWatchedAt.entries()].sort(([, a], [, b]) => b.getTime() - a.getTime())
      );
      let maxIndex = episodesBySerie.episodes.length;

      for (const index of [...indexByWatchedAtSorted.keys(), -1]) {
        const notSeenEpisodes = episodes
          .slice(index + 1, maxIndex)
          .filter((episode) => episode.users.length === 0);
        if (notSeenEpisodes.length !== 0) {
          const { users, ...upcommingEpisode } = notSeenEpisodes[0];
          upcommingEpisodes.push({
            seriesName: episodesBySerie.name,
            seriesBackdropPath: episodesBySerie.backdropPath,
            status: episodesBySerie.users[0].status,
            ...upcommingEpisode
          });
          break;
        }
        maxIndex = index;
      }
    }

    return {
      WATCHING: upcommingEpisodes.filter(({ status }) => status === "WATCHING"),
      PAUSED: upcommingEpisodes.filter(({ status }) => status === "PAUSED"), // TODO #263: unused in frontend
      DROPPED: upcommingEpisodes.filter(({ status }) => status === "DROPPED")
    };
  },

  async episodeUpcomingGet(userId: string, now = new Date()) {
    const episodes = await listUserUpcomingEpisodes(userId, now);

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
    await seriesRepository.requireById(params.seriesId);

    return userSeriesRepository.upsert(userId, params.seriesId, body, now);
  },

  async episodePost(userId: string, params: UserEpisodePostParams, now = new Date()) {
    const { seriesId, episodeId } = params;
    const releaseCutoff = getEpisodeReleaseCutoff(now);

    return prisma.$transaction(async (tx) => {
      const series = await seriesRepository.requireById(seriesId, tx);

      const episode = await episodeRepository.requireReleasedById(
        episodeId,
        seriesId,
        releaseCutoff,
        tx
      );

      const createdUserEpisode = await userEpisodeRepository.create(userId, episodeId, now, tx);

      if (createdUserEpisode) {
        const watchCountIncrement = episode.seasonNumber === 0 ? 0 : 1;

        const userSeries = await userSeriesRepository.upsertProgress(
          userId,
          seriesId,
          now,
          watchCountIncrement,
          1,
          tx
        );

        const status = getUserSeriesStatus(
          userSeries.watchedEpisodeCount,
          userSeries.watchCount,
          series.numberOfEpisodes,
          series.inProduction
        );

        if (status !== userSeries.status) {
          await userSeriesRepository.update(userId, seriesId, { status }, tx);
        }

        return createdUserEpisode;
      }

      return userEpisodeRepository.requireByEpisodeId(userId, episodeId, tx);
    });
  },

  async episodeDelete(userId: string, params: UserEpisodeDeleteParams) {
    const { seriesId, episodeId } = params;

    return prisma.$transaction(async (tx) => {
      const episode = await episodeRepository.requireById(episodeId, seriesId, tx);
      const series = await seriesRepository.requireById(seriesId, tx);

      await userSeriesRepository.requireBySeriesId(userId, seriesId, tx);
      await userEpisodeRepository.requireByEpisodeId(userId, episodeId, tx);

      const deletedUserEpisode = await userEpisodeRepository.delete(userId, episodeId, tx);

      if (deletedUserEpisode) {
        const watchCountDecrement = episode.seasonNumber === 0 ? 0 : -1;

        const lastWatchedAt = await userEpisodeRepository.getLastWatchedAtBySeriesId(
          userId,
          seriesId,
          tx
        );

        const updatedUserSeries = await userSeriesRepository.updateProgress(
          userId,
          seriesId,
          lastWatchedAt,
          watchCountDecrement,
          -1,
          tx
        );

        const status = getUserSeriesStatus(
          updatedUserSeries.watchedEpisodeCount,
          updatedUserSeries.watchCount,
          series.numberOfEpisodes,
          series.inProduction
        );

        await userSeriesRepository.update(userId, seriesId, { status, lastWatchedAt }, tx);

        return deletedUserEpisode;
      }

      throw notFound("USER_EPISODE_NOT_FOUND", "Episode for this user not found");
    });
  },

  async seasonPost(userId: string, params: UserSeasonPostParams, now = new Date()) {
    const { seriesId, seasonId } = params;
    const releaseCutoff = getEpisodeReleaseCutoff(now);

    return prisma.$transaction(async (tx) => {
      const series = await seriesRepository.requireById(seriesId, tx);
      const episodes = await episodeRepository.listNotEmptyReleasedBySeasonId(
        seasonId,
        seriesId,
        releaseCutoff,
        tx
      );
      const episodeIds = episodes.map((episode) => episode.id);

      const createdUserEpisodes = await userEpisodeRepository.createMany(
        episodes.map((episode) => ({ userId, episodeId: episode.id, watchedAt: now })),
        tx
      );

      if (createdUserEpisodes.length === 0) {
        return userEpisodeRepository.listByEpisodeIds(userId, episodeIds, tx);
      }

      const regularEpisodeIds = new Set(
        episodes.filter((episode) => episode.seasonNumber !== 0).map((episode) => episode.id)
      );
      const watchCountIncrement = createdUserEpisodes.filter((episode) =>
        regularEpisodeIds.has(episode.episodeId)
      ).length;

      const userSeries = await userSeriesRepository.upsertProgress(
        userId,
        seriesId,
        now,
        watchCountIncrement,
        createdUserEpisodes.length,
        tx
      );

      const status = getUserSeriesStatus(
        userSeries.watchedEpisodeCount,
        userSeries.watchCount,
        series.numberOfEpisodes,
        series.inProduction
      );

      if (status !== userSeries.status) {
        await userSeriesRepository.update(userId, seriesId, { status }, tx);
      }

      return userEpisodeRepository.listByEpisodeIds(userId, episodeIds, tx);
    });
  },

  async seasonDelete(userId: string, params: UserSeasonDeleteParams) {
    const { seriesId, seasonId } = params;

    return prisma.$transaction(async (tx) => {
      const episodes = await episodeRepository.listNotEmptyBySeasonId(seasonId, seriesId, tx);
      const series = await seriesRepository.requireById(seriesId, tx);

      await userSeriesRepository.requireBySeriesId(userId, seriesId, tx);

      const deletedUserEpisodes = await userEpisodeRepository.deleteMany(
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
      const watchCountDecrement = -deletedUserEpisodes.filter((episode) =>
        regularEpisodeIds.has(episode.episodeId)
      ).length;

      const lastWatchedAt = await userEpisodeRepository.getLastWatchedAtBySeriesId(
        userId,
        seriesId,
        tx
      );

      const updatedUserSeries = await userSeriesRepository.updateProgress(
        userId,
        seriesId,
        lastWatchedAt,
        watchCountDecrement,
        -deletedUserEpisodes.length,
        tx
      );

      const status = getUserSeriesStatus(
        updatedUserSeries.watchedEpisodeCount,
        updatedUserSeries.watchCount,
        series.numberOfEpisodes,
        series.inProduction
      );

      await userSeriesRepository.update(userId, seriesId, { status }, tx);

      return deletedUserEpisodes;
    });
  },

  async dashboardSummaryGet(userId: string) {
    const { episodesSummary, seriesSummary } = await getUserDashboardSummary(userId);

    return {
      totalWatchedMinutes: episodesSummary._sum.runtime ?? 0,
      totalWatchedEpisodes: episodesSummary._count,
      totalWatchedSeries: seriesSummary._count
    };
  },

  async seriesReconcilePost(params: UserSeriesReconcilePostParams, now = new Date()) {
    const inactiveSince = new Date(now);
    inactiveSince.setUTCDate(inactiveSince.getUTCDate() - 60);

    return prisma.$transaction(async (tx) => {
      const { seriesProgress, userSeries } = await getUserSeriesReconciliation(params.userId, tx);
      const progressBySeriesId = new Map(
        seriesProgress.map((progress) => [progress.seriesId, progress])
      );

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
              userSeriesRepository.update(
                item.userId,
                item.seriesId,
                { watchedEpisodeCount, watchCount, lastWatchedAt, status },
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

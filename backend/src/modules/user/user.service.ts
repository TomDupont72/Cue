import { prisma } from "@/shared/db/prisma.js";
import { userRepository } from "./user.repository.js";
import {
  UserEpisodePostParams,
  UserSeriesPostBody,
  UserSeriesPostParams,
  UserEpisodeDeleteParams,
  UserSeriesGetParams,
  UserSeasonPostParams,
  UserSeasonDeleteParams,
  UserStatusPostParams
} from "./user.schemas.js";
import { episodeRepository } from "../episode/episode.repository.js";
import { notFound } from "@/shared/errors/errors.helpers.js";
import { seriesRepository } from "../series/series.repository.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import type { UserSeries, UserSeriesStatus } from "@/generated/prisma/client.js";
import { getEpisodeReleaseCutoff } from "../episode/episode.utils.js";

type SeriesProgressParams = {
  userId: string;
  seriesId: number;
  numberOfEpisodes: number;
  delta: number;
};

function getStatusAfterAddingEpisodes(
  watchCount: number,
  numberOfEpisodes: number
): UserSeriesStatus {
  return watchCount >= numberOfEpisodes ? "COMPLETED" : "WATCHING";
}

function getStatusAfterRemovingEpisodes(watchCount: number): UserSeriesStatus {
  return watchCount === 0 ? "PLANNED" : "WATCHING";
}

async function updateSeriesStatus(userSeries: UserSeries, status: UserSeriesStatus, tx: PrismaTx) {
  if (status === userSeries.status) {
    return userSeries;
  }

  return userRepository.updateSeries(
    {
      userId_seriesId: {
        userId: userSeries.userId,
        seriesId: userSeries.seriesId
      }
    },
    { status },
    tx
  );
}

async function addSeriesProgress(
  { userId, seriesId, numberOfEpisodes, delta }: SeriesProgressParams,
  watchedAt: Date,
  tx: PrismaTx
) {
  const userSeries = await userRepository.incrementSeriesProgress(
    userId,
    seriesId,
    delta,
    watchedAt,
    tx
  );

  if (!userSeries) {
    throw notFound("Series for this user");
  }

  return updateSeriesStatus(
    userSeries,
    getStatusAfterAddingEpisodes(userSeries.watchCount, numberOfEpisodes),
    tx
  );
}

async function removeSeriesProgress(
  { userId, seriesId, delta }: Omit<SeriesProgressParams, "numberOfEpisodes">,
  tx: PrismaTx
) {
  const updatedUserSeries = await userRepository.updateSeries(
    {
      userId_seriesId: {
        userId,
        seriesId
      }
    },
    { watchCount: { decrement: delta } },
    tx
  );

  return updateSeriesStatus(
    updatedUserSeries,
    getStatusAfterRemovingEpisodes(updatedUserSeries.watchCount),
    tx
  );
}

export const userService = {
  async userSeriesGet(userId: string, params: UserSeriesGetParams) {
    const { seriesId, status, limit, cursor } = params;

    const userSeries = await userRepository.findManySeries(
      { userId, seriesId, status },
      limit,
      cursor
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

  async userEpisodeFeedGet(userId: string) {
    const episodes = await userRepository.getEpisodesFeed(userId);

    return {
      watching: episodes.filter(({ status }) => status === "WATCHING"),
      paused: episodes.filter(({ status }) => status === "PAUSED"),
      dropped: episodes.filter(({ status }) => status === "DROPPED")
    };
  },

  async userSeriesPost(userId: string, params: UserSeriesPostParams, body: UserSeriesPostBody) {
    const userSeries = await userRepository.upsertSeries(
      { userId_seriesId: { userId, ...params } },
      { userId, ...params, ...body },
      { ...body }
    );

    return userSeries;
  },

  async userEpisodePost(userId: string, params: UserEpisodePostParams, now = new Date()) {
    const { seriesId, episodeId } = params;

    return prisma.$transaction(async (tx) => {
      const episode = await episodeRepository.findOne(
        {
          id: episodeId,
          seriesId,
          airDate: { lt: getEpisodeReleaseCutoff(now) }
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

      await userRepository.ensureSeries(userId, seriesId, tx);

      const [createdUserEpisode] = await userRepository.createManyEpisodes(
        [{ userId, episodeId, watchedAt: now }],
        tx
      );

      if (!createdUserEpisode) {
        const userEpisode = await userRepository.findOneEpisode(
          { userId_episodeId: { userId, episodeId } },
          tx
        );

        if (!userEpisode) {
          throw notFound("Episode for this user");
        }

        const nextEpisode = await userRepository.getEpisodeFeedItem(userId, seriesId, tx);

        return {
          ...userEpisode,
          seriesId,
          nextEpisode
        };
      }

      await addSeriesProgress(
        {
          userId,
          seriesId,
          numberOfEpisodes: series.numberOfEpisodes,
          delta: episode.seasonNumber === 0 ? 0 : 1
        },
        now,
        tx
      );

      const nextEpisode = await userRepository.getEpisodeFeedItem(userId, seriesId, tx);

      return {
        ...createdUserEpisode,
        seriesId,
        nextEpisode
      };
    });
  },

  async userEpisodeDelete(userId: string, params: UserEpisodeDeleteParams) {
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

      const deletedUserEpisodes = await userRepository.deleteEpisodes(userId, [episodeId], tx);

      if (deletedUserEpisodes.length === 0) {
        throw notFound("Episode for this user");
      }

      await removeSeriesProgress(
        {
          userId,
          seriesId,
          delta: episode.seasonNumber === 0 ? 0 : deletedUserEpisodes.length
        },
        tx
      );

      return deletedUserEpisodes[0];
    });
  },

  async userSeasonPost(userId: string, params: UserSeasonPostParams, now = new Date()) {
    const { seriesId, seasonId } = params;

    return prisma.$transaction(async (tx) => {
      const episodes = await episodeRepository.findMany(
        {
          seriesId,
          seasonId,
          airDate: { lt: getEpisodeReleaseCutoff(now) }
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

      await userRepository.ensureSeries(userId, seriesId, tx);

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
      const delta = createdUserEpisodes.filter((episode) =>
        regularEpisodeIds.has(episode.episodeId)
      ).length;

      await addSeriesProgress(
        { userId, seriesId, numberOfEpisodes: series.numberOfEpisodes, delta },
        now,
        tx
      );

      return createdUserEpisodes;
    });
  },

  async userSeasonDelete(userId: string, params: UserSeasonDeleteParams) {
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
      const delta = deletedUserEpisodes.filter((episode) =>
        regularEpisodeIds.has(episode.episodeId)
      ).length;

      await removeSeriesProgress(
        {
          userId,
          seriesId,
          delta
        },
        tx
      );

      return deletedUserEpisodes;
    });
  },

  async userDashboardSummaryGet(userId: string) {
    const summary = await userRepository.getDashboardSummary(userId);

    return summary;
  },

  async userStatusRecalculatePost(params: UserStatusPostParams, now = new Date()) {
    const inactiveSince = new Date(now);
    inactiveSince.setUTCMonth(inactiveSince.getUTCMonth() - 2);

    const result = await userRepository.updateManySeries(
      {
        userId: params.userId,
        status: "WATCHING",
        lastWatchedAt: {
          lte: inactiveSince
        }
      },
      {
        status: "DROPPED"
      }
    );

    return {
      updatedCount: result.count
    };
  }
};

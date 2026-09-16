import { episodeRepository, episodeSelectQuery } from "@/modules/episode/episode.repository.js";
import { seasonRepository, seasonsSelectQuery } from "@/modules/season/season.repository.js";
import { seriesRepository, seriesSelectQuery } from "@/modules/series/series.repository.js";
import type {
  SeriesGetParams,
  SeriesImportPostBody,
  SeriesReconcilePostBody
} from "@/modules/series/series.schemas.js";
import { notFound } from "@/shared/errors/errors.helpers.js";
import {
  userEpisodeSelectQuery,
  userRepository,
  userSeriesSelectQuery
} from "@/modules/user/user.repository.js";
import { syncTmdb } from "@/modules/series/series.rules.js";
import { getEpisodeReleaseCutoff } from "@/modules/episode/episode.utils.js";

export const seriesService = {
  async get(userId: string, params: SeriesGetParams) {
    const series = await seriesSelectQuery().where(params).emptyThrow().first();
    const seasons = await seasonsSelectQuery().where({ seriesId: series.id }).all();
    const episodes = await episodeSelectQuery().where({ seriesId: series.id }).all();
    const userSeries = await userSeriesSelectQuery().where({ userId, seriesId: series.id }).first();
    const userEpisodes = await userEpisodeSelectQuery()
      .where({ userId, episode: { seriesId: series.id } })
      .all();

    return { series, seasons, episodes, userSeries, userEpisodes };
  },

  async importPost(userId: string | null, body: SeriesImportPostBody, forceSync = false) {
    const existingSeries = await seriesRepository.findOne(body);
    const series = existingSeries && !forceSync ? existingSeries : await syncTmdb(body.tmdbId);
    const userSeries = userId
      ? await userRepository.findOneSeries({
          userId_seriesId: { userId, seriesId: series.id }
        })
      : null;

    return { series, userSeries };
  },

  async reconcilePost(body: SeriesReconcilePostBody, now = new Date()) {
    const tmdbIds = [...new Set(body.tmdbIds)];
    const releaseCutoff = getEpisodeReleaseCutoff(now);
    const updatedCount = await seriesRepository.reconcileEpisodeCounts(tmdbIds, releaseCutoff);

    return { updatedCount };
  }
};

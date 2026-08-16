import { episodeRepository } from "@/modules/episode/episode.repository.js";
import { seasonRepository } from "@/modules/season/season.repository.js";
import { seriesRepository } from "@/modules/series/series.repository.js";
import type {
  SeriesGetParams,
  SeriesImportPostBody,
  SeriesReconcilePostBody
} from "@/modules/series/series.schemas.js";
import { notFound } from "@/shared/errors/errors.helpers.js";
import { userRepository } from "@/modules/user/user.repository.js";
import { syncTmdb } from "@/modules/series/series.rules.js";
import { getEpisodeReleaseCutoff } from "@/modules/episode/episode.utils.js";

export const seriesService = {
  async get(userId: string, params: SeriesGetParams) {
    const series = await seriesRepository.findOne(params);

    if (!series) {
      throw notFound("SERIES_NOT_FOUND", "Series not found");
    }

    const [seasons, episodes, userSeries, userEpisodes] = await Promise.all([
      seasonRepository.findMany({
        seriesId: series.id
      }),
      episodeRepository.findMany({
        seriesId: series.id
      }),
      userRepository.findOneSeries({
        userId_seriesId: { userId, seriesId: series.id }
      }),
      userRepository.findManyEpisodes({
        userId,
        episode: {
          seriesId: series.id
        }
      })
    ]);

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

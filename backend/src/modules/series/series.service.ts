import { episodeRepository } from "@/modules/episode/episode.repository.js";
import { seasonRepository } from "@/modules/season/season.repository.js";
import { seriesRepository } from "@/modules/series/series.repository.js";
import type { SeriesGetParams, SeriesImportPostBody } from "@/modules/series/series.schemas.js";
import { notFound } from "@/shared/errors/errors.helpers.js";
import { userRepository } from "@/modules/user/user.repository.js";
import { syncTmdb } from "@/modules/series/series.rules.js";

export const seriesService = {
  async get(userId: string, params: SeriesGetParams) {
    const series = await seriesRepository.findOne(params);

    if (!series) {
      throw notFound("Series");
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
  }
};

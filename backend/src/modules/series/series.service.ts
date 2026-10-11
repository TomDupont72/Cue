import { listEpisodeBySeriesId } from "@/modules/episode/episode.repository.js";
import { listSeasonBySeriesId } from "@/modules/season/season.repository.js";
import {
  findSeriesByTmdbId,
  listSeriesByTmdbIds,
  requireSeriesById,
  updateSeries
} from "@/modules/series/series.repository.js";
import type {
  SeriesGetParams,
  SeriesImportPostBody,
  SeriesReconcilePostBody
} from "@/modules/series/series.schemas.js";
import {
  listUserEpisodeBySeriesId,
  findUserSeriesBySeriesId
} from "@/modules/user/user.repository.js";
import { syncTmdb } from "@/modules/series/series.rules.js";
import { getEpisodeReleaseCutoff } from "@/modules/episode/episode.utils.js";
import { prisma } from "@/shared/db/prisma.js";
import { listProviderBySeriesId } from "@/modules/provider/provider.repository.js";
import { listGenreBySeriesId } from "../genre/genre.repository.js";
import { listEpisodeCounts } from "../episode/queries/listEpisodeCounts.query.js";

export const seriesService = {
  async get(userId: string, params: SeriesGetParams) {
    const series = await requireSeriesById(params.id);
    const seasons = await listSeasonBySeriesId(series.id);
    const episodes = await listEpisodeBySeriesId(series.id);
    const userSeries = await findUserSeriesBySeriesId(userId, series.id);
    const userEpisodes = await listUserEpisodeBySeriesId(userId, series.id);
    const seriesProviders = await listProviderBySeriesId(series.id);
    const seriesGenres = await listGenreBySeriesId(series.id);

    return { series, seasons, episodes, userSeries, userEpisodes, seriesProviders, seriesGenres };
  },

  async importPost(userId: string | null, body: SeriesImportPostBody, forceSync = false) {
    const existingSeries = await findSeriesByTmdbId(body.tmdbId);
    const series = existingSeries && !forceSync ? existingSeries : await syncTmdb(body.tmdbId);
    const userSeries = userId ? await findUserSeriesBySeriesId(userId, series.id) : null;

    return { series, userSeries };
  },

  async reconcilePost(body: SeriesReconcilePostBody, now = new Date()) {
    const tmdbIds = [...new Set(body.tmdbIds)];
    const releaseCutoff = getEpisodeReleaseCutoff(now);

    if (tmdbIds.length === 0) {
      return { updatedCount: 0 };
    }

    const updatedCount = await prisma.$transaction(async (tx) => {
      const series = await listSeriesByTmdbIds(tmdbIds, tx);
      const seriesIds = series.map((serie) => serie.id);

      const episodeCounts = await listEpisodeCounts(seriesIds, releaseCutoff, tx);
      const episodeCountBySeriesId = new Map(
        episodeCounts.map((item) => [item.seriesId, item._count])
      );
      const updates = series.flatMap((serie) => {
        const numberOfEpisodes = episodeCountBySeriesId.get(serie.id) ?? 0;

        return serie.numberOfEpisodes === numberOfEpisodes
          ? []
          : [updateSeries(serie.id, { numberOfEpisodes }, tx)];
      });

      await Promise.all(updates);

      return updates.length;
    });

    return { updatedCount };
  }
};

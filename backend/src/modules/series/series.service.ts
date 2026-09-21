import {
  episodeRelationalSelectQuery,
  episodeSelectQuery
} from "@/modules/episode/episode.repository.js";
import { seasonsSelectQuery } from "@/modules/season/season.repository.js";
import {
  seriesRepository,
  seriesSelectQuery,
  seriesUpdateQuery
} from "@/modules/series/series.repository.js";
import type {
  SeriesGetParams,
  SeriesImportPostBody,
  SeriesReconcilePostBody
} from "@/modules/series/series.schemas.js";
import {
  userEpisodeSelectQuery,
  userRepository,
  userSeriesSelectQuery
} from "@/modules/user/user.repository.js";
import { syncTmdb } from "@/modules/series/series.rules.js";
import { getEpisodeReleaseCutoff } from "@/modules/episode/episode.utils.js";
import { prisma } from "@/shared/db/prisma.js";
import { count } from "@/shared/db/aggregateExpressions.js";
import { episodeTable } from "@/shared/db/constants/queryTables.js";
import { lt, ne } from "@/shared/db/queryExpressions.js";

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

    if (tmdbIds.length === 0) {
      return { updatedCount: 0 };
    }

    const updatedCount = await prisma.$transaction(async (tx) => {
      const series = await seriesSelectQuery(tx)
        .where({ tmdbId: { in: tmdbIds } })
        .all();
      const episodeCounts = await episodeRelationalSelectQuery(tx)
        .select({
          seriesId: episodeTable.seriesId,
          numberOfEpisodes: count()
        })
        .where({ seriesId: { in: series.map((item) => item.id) } })
        .where(ne(episodeTable.seasonNumber, 0))
        .where(lt(episodeTable.airDate, releaseCutoff))
        .groupBy(episodeTable.seriesId)
        .all();
      const episodeCountBySeriesId = new Map(
        episodeCounts.map((item) => [item.seriesId, item.numberOfEpisodes])
      );
      const updates = series.flatMap((item) => {
        const numberOfEpisodes = episodeCountBySeriesId.get(item.id) ?? 0;

        return item.numberOfEpisodes === numberOfEpisodes
          ? []
          : [seriesUpdateQuery(tx).where({ id: item.id }).set({ numberOfEpisodes }).execute()];
      });

      await Promise.all(updates);

      return updates.length;
    });

    return { updatedCount };
  }
};

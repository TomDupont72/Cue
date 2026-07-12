import { tvDetails } from "@/external/tmdb/tmdb.tv-details.js";
import { seriesRepository } from "./series.repository.js";
import { SeriesImport } from "./series.schemas.js";
import { seasonDetails } from "@/external/tmdb/tmdb.season-details.js";
import { episodeDetails } from "@/external/tmdb/tmdb.episode-details.js";
import { traceProcessWarnings } from "node:process";
import { PrismaClient } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { networkRepository } from "../network/network.repository.js";
import { dropKeys } from "@/shared/utils/object.js";

export const seriesService = {
  async seriesImport(input: SeriesImport) {
    const result = await seriesRepository.findOne(input);

    if (result) {
      return result;
    }

    const tmdbSeriesResult = await tvDetails(input.tmdbId);

    const tmdbSeasonResults = await Promise.all(
      tmdbSeriesResult.seasons.map((season) => seasonDetails(input.tmdbId, season.seasonNumber))
    );
    
    return prisma.$transaction(async (tx) => {
      const series = await seriesRepository.upsert(
        { tmdbId: tmdbSeriesResult.tmdbId },
        dropKeys(tmdbSeriesResult, ["createdBy", "genres", "networks", "seasons"] as const),
        tx
      );

      await seriesRepository.addGenres(
        series.id,
        tmdbSeriesResult.genres.map((genre) => genre.id),
        tx
      );

      await networkRepository.createMany(
        tmdbSeriesResult.networks,
        tx
      );

      await seriesRepository.addNetworks(
        series.id,
        tmdbSeriesResult.networks.map((network) => network.id),
        tx
      );

      for (const seasonDetails of tmdbSeasonResults) {
        const season = await seasonRepository.upsertSeason(
          series.id,
          mapTmdbSeasonToSeasonData(seasonDetails),
          tx
        );

        await episodeRepository.upsertEpisodes(
          series.id,
          season.id,
          seasonDetails.episodes.map((episode) => mapTmdbEpisodeToEpisodeData(episode)),
          tx
        );
      }

      return tmdbSeriesResult;
    });
  }
};

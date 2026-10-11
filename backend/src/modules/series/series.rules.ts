import { seasonDetails } from "@/external/tmdb/tmdb.season-details.js";
import { tvDetails } from "@/external/tmdb/tmdb.tv-details.js";
import { prisma } from "@/shared/db/prisma.js";
import { characterRepository } from "@/modules/character/character.repository.js";
import {
  episodeCharacterRepository,
  episodePeopleRepository,
  episodeRepository
} from "@/modules/episode/episode.repository.js";
import { genreRepository } from "@/modules/genre/genre.repository.js";
import { networkRepository } from "@/modules/network/network.repository.js";
import { peopleRepository } from "@/modules/people/people.repository.js";
import { seasonRepository } from "@/modules/season/season.repository.js";
import {
  seriesGenreRepository,
  seriesNetworkRepository,
  seriesPeopleRepository,
  seriesProviderRepository,
  seriesRepository
} from "@/modules/series/series.repository.js";
import { dropKeys, getMany, joinBy } from "@/shared/utils/object/object.js";
import type { Prisma } from "@/generated/prisma/client.js";
import type {
  TmdbEpisodeDetailsGuestStar,
  TmdbEpisodeDetailsResponse
} from "@/external/tmdb/tmdb.types.js";
import { tvWatchProviders } from "@/external/tmdb/tmdb.tv-watch-providers.js";
import { providerRepository } from "@/modules/provider/provider.repository.js";

export async function syncTmdb(tmdbId: number) {
  const tmdbSeries = await tvDetails(tmdbId);
  const tmdbSeasons = await Promise.all(
    tmdbSeries.seasons.map((season) => seasonDetails(tmdbId, season.seasonNumber))
  );
  const tmdbEpisodes = getMany<TmdbEpisodeDetailsResponse>({
    data: tmdbSeasons,
    fields: ["episodes"]
  });
  const providersResult = await tvWatchProviders(tmdbId);
  const providersFR = providersResult.results.FR?.flatrate ?? [];

  return prisma.$transaction(
    async (tx) => {
      const seriesData = dropKeys(tmdbSeries, [
        "createdBy",
        "genres",
        "networks",
        "seasons"
      ] as const);
      const series = await seriesRepository.upsert(seriesData, tx);

      const genres = await genreRepository.upsertMany(tmdbSeries.genres, tx);
      await seriesGenreRepository.replaceBySeriesId(
        series.id,
        genres.map((genre) => genre.id),
        tx
      );

      const networks = await networkRepository.upsertMany(tmdbSeries.networks, tx);
      await seriesNetworkRepository.replaceBySeriesId(
        series.id,
        networks.map((network) => network.id),
        tx
      );

      const providers = await providerRepository.upsertMany(providersFR, tx);
      await seriesProviderRepository.replaceBySeriesId(
        series.id,
        providers.map((provider) => provider.id),
        tx
      );

      const people = await peopleRepository.upsertMany(
        getMany<Prisma.PeopleCreateManyInput>(
          { data: tmdbSeries, fields: ["createdBy"] },
          { data: tmdbEpisodes, fields: ["crew", "guestStars"] }
        ),
        tx
      );
      const creatorIds = joinBy(
        { data: tmdbSeries.createdBy, key: "tmdbId" },
        { data: people, key: "tmdbId", value: "id" }
      );

      await seriesPeopleRepository.replaceBySeriesId(series.id, creatorIds, tx);

      const characters = await characterRepository.ensureMany(
        joinBy(
          {
            data: getMany<TmdbEpisodeDetailsGuestStar>({
              data: tmdbEpisodes,
              fields: ["guestStars"]
            }),
            key: "tmdbId",
            value: "character",
            as: "name"
          },
          { data: people, key: "tmdbId", value: "id", as: "peopleId" }
        ),
        tx
      );

      const seasons = await seasonRepository.upsertMany(
        tmdbSeasons.map((season) => ({
          ...dropKeys(season, ["episodes"] as const),
          seriesId: series.id
        })),
        tx
      );

      const episodes = await episodeRepository.upsertMany(
        joinBy(
          { data: tmdbEpisodes, key: "seasonNumber" },
          {
            data: seasons,
            key: "seasonNumber",
            select: (season, episode) => ({
              ...dropKeys(episode, ["crew", "guestStars"] as const),
              seriesId: series.id,
              seasonId: season.id
            })
          }
        ),
        tx
      );

      const episodeCrew = joinBy(
        { data: tmdbEpisodes, key: "tmdbId" },
        {
          data: episodes,
          key: "tmdbId",
          select: (episode, tmdbEpisode) =>
            tmdbEpisode.crew.map((person) => ({ episodeId: episode.id, person }))
        }
      );

      await episodePeopleRepository.replaceByEpisodeIds(
        episodes.map((episode) => episode.id),
        joinBy(
          { data: episodeCrew, key: ({ person }) => person.tmdbId },
          {
            data: people,
            key: "tmdbId",
            select: (person, { episodeId }) => ({ episodeId, peopleId: person.id })
          }
        ),
        tx
      );

      const episodeGuestStars = joinBy(
        { data: tmdbEpisodes, key: "tmdbId", value: "guestStars", as: "guestStar" },
        { data: episodes, key: "tmdbId", value: "id", as: "episodeId" }
      );

      const episodeGuestStarsWithPeople = joinBy(
        { data: episodeGuestStars, key: ({ guestStar }) => guestStar.tmdbId },
        {
          data: people,
          key: "tmdbId",
          select: (person, episodeGuestStar) => ({ ...episodeGuestStar, peopleId: person.id })
        }
      );

      await episodeCharacterRepository.replaceByEpisodeIds(
        episodes.map((episode) => episode.id),
        joinBy(
          {
            data: episodeGuestStarsWithPeople,
            key: ({ peopleId, guestStar }) => `${peopleId}:${guestStar.character}`
          },
          {
            data: characters,
            key: (character) => `${character.peopleId}:${character.name}`,
            select: (character, { episodeId }) => ({ episodeId, characterId: character.id })
          }
        ),
        tx
      );

      return series;
    },
    {
      timeout: 30_000,
      maxWait: 5_000
    }
  );
}

import { seasonDetails } from "@/external/tmdb/tmdb.season-details.js";
import { tvDetails } from "@/external/tmdb/tmdb.tv-details.js";
import { prisma } from "@/shared/db/prisma.js";
import { ensureCharacters } from "@/modules/character/character.repository.js";
import {
  replaceEpisodeCharacters,
  replaceEpisodePeople,
  upsertEpisodes
} from "@/modules/episode/episode.repository.js";
import { upsertGenres } from "@/modules/genre/genre.repository.js";
import { upsertNetworks } from "@/modules/network/network.repository.js";
import { upsertPeople } from "@/modules/people/people.repository.js";
import { upsertSeasons } from "@/modules/season/season.repository.js";
import {
  replaceSeriesGenres,
  replaceSeriesNetworks,
  replaceSeriesPeople,
  replaceSeriesProviders,
  upsertSeries
} from "@/modules/series/series.repository.js";
import { dropKeys, getMany, joinBy } from "@/shared/utils/object/object.js";
import type { Prisma } from "@/generated/prisma/client.js";
import type {
  TmdbEpisodeDetailsGuestStar,
  TmdbEpisodeDetailsResponse
} from "@/external/tmdb/tmdb.types.js";
import { tvWatchProviders } from "@/external/tmdb/tmdb.tv-watch-providers.js";
import { upsertProviders } from "@/modules/provider/provider.repository.js";

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
      const series = await upsertSeries(seriesData, tx);

      const genres = await upsertGenres(tmdbSeries.genres, tx);
      await replaceSeriesGenres(
        series.id,
        genres.map((genre) => genre.id),
        tx
      );

      const networks = await upsertNetworks(tmdbSeries.networks, tx);
      await replaceSeriesNetworks(
        series.id,
        networks.map((network) => network.id),
        tx
      );

      const providers = await upsertProviders(providersFR, tx);
      await replaceSeriesProviders(
        series.id,
        providers.map((provider) => provider.id),
        tx
      );

      const people = await upsertPeople(
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

      await replaceSeriesPeople(series.id, creatorIds, tx);

      const characters = await ensureCharacters(
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

      const seasons = await upsertSeasons(
        tmdbSeasons.map((season) => ({
          ...dropKeys(season, ["episodes"] as const),
          seriesId: series.id
        })),
        tx
      );

      const episodes = await upsertEpisodes(
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

      await replaceEpisodePeople(
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

      await replaceEpisodeCharacters(
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

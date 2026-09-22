import { seasonDetails } from "@/external/tmdb/tmdb.season-details.js";
import { tvDetails } from "@/external/tmdb/tmdb.tv-details.js";
import { prisma } from "@/shared/db/prisma.js";
import { characterInsertQuery } from "@/modules/character/character.repository.js";
import {
  episodeCharacterDeleteQuery,
  episodeCharacterInsertQuery,
  episodePeopleDeleteQuery,
  episodePeopleInsertQuery,
  episodeUpsertQuery
} from "@/modules/episode/episode.repository.js";
import { genreUpsertQuery } from "@/modules/genre/genre.repository.js";
import { networkUpsertQuery } from "@/modules/network/network.repository.js";
import { peopleUpsertQuery } from "@/modules/people/people.repository.js";
import { seasonUpsertQuery } from "@/modules/season/season.repository.js";
import {
  seriesGenreDeleteQuery,
  seriesGenreInsertQuery,
  seriesNetworkDeleteQuery,
  seriesNetworkInsertQuery,
  seriesPeopleDeleteQuery,
  seriesPeopleInsertQuery,
  seriesProviderDeleteQuery,
  seriesProviderInsertQuery,
  seriesUpsertQuery
} from "@/modules/series/series.repository.js";
import { dropKeys, getMany, joinBy } from "@/shared/utils/object/object.js";
import { Prisma } from "@/generated/prisma/client.js";
import type {
  TmdbEpisodeDetailsGuestStar,
  TmdbEpisodeDetailsResponse
} from "@/external/tmdb/tmdb.types.js";
import { tvWatchProviders } from "@/external/tmdb/tmdb.tv-watch-providers.js";
import { providerUpsertQuery } from "@/modules/provider/provider.repository.js";

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
  const providersFR = [
    ...(providersResult.results.FR?.buy ?? []),
    ...(providersResult.results.FR?.flatrate ?? [])
  ];

  return prisma.$transaction(
    async (tx) => {
      const seriesData = dropKeys(tmdbSeries, [
        "createdBy",
        "genres",
        "networks",
        "seasons"
      ] as const);
      const series = await seriesUpsertQuery(tx)
        .where({ tmdbId: tmdbSeries.tmdbId })
        .create(seriesData)
        .update(seriesData)
        .first();

      const genres = await genreUpsertQuery(tx).values(tmdbSeries.genres).all();
      await seriesGenreDeleteQuery(tx).where({ seriesId: series.id }).execute();
      await seriesGenreInsertQuery(tx)
        .values(genres.map((genre) => ({ seriesId: series.id, genreId: genre.id })))
        .skipDuplicates()
        .execute();

      const networks = await networkUpsertQuery(tx).values(tmdbSeries.networks).all();
      await seriesNetworkDeleteQuery(tx).where({ seriesId: series.id }).execute();
      await seriesNetworkInsertQuery(tx)
        .values(networks.map((network) => ({ seriesId: series.id, networkId: network.id })))
        .skipDuplicates()
        .execute();

      const providers = await providerUpsertQuery(tx).values(providersFR).all();
      await seriesProviderDeleteQuery(tx).where({ seriesId: series.id }).execute();
      await seriesProviderInsertQuery(tx)
        .values(providers.map((provider) => ({ seriesId: series.id, providerId: provider.id })))
        .skipDuplicates()
        .execute();

      const people = await peopleUpsertQuery(tx)
        .values(
          getMany<Prisma.PeopleCreateManyInput>(
            { data: tmdbSeries, fields: ["createdBy"] },
            { data: tmdbEpisodes, fields: ["crew", "guestStars"] }
          )
        )
        .all();
      const creatorIds = joinBy(
        { data: tmdbSeries.createdBy, key: "tmdbId" },
        { data: people, key: "tmdbId", value: "id" }
      );

      await seriesPeopleDeleteQuery(tx).where({ seriesId: series.id }).execute();
      await seriesPeopleInsertQuery(tx)
        .values(creatorIds.map((peopleId) => ({ seriesId: series.id, peopleId })))
        .skipDuplicates()
        .execute();

      const characters = await characterInsertQuery(tx)
        .values(
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
          )
        )
        .skipDuplicates()
        .all();

      const seasons = await seasonUpsertQuery(tx)
        .values(
          tmdbSeasons.map((season) => ({
            ...dropKeys(season, ["episodes"] as const),
            seriesId: series.id
          }))
        )
        .all();

      const episodes = await episodeUpsertQuery(tx)
        .values(
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
          )
        )
        .all();

      const episodeCrew = joinBy(
        { data: tmdbEpisodes, key: "tmdbId" },
        {
          data: episodes,
          key: "tmdbId",
          select: (episode, tmdbEpisode) =>
            tmdbEpisode.crew.map((person) => ({ episodeId: episode.id, person }))
        }
      );

      await episodePeopleDeleteQuery(tx)
        .where({ episodeId: { in: episodes.map((episode) => episode.id) } })
        .execute();
      await episodePeopleInsertQuery(tx)
        .values(
          joinBy(
            { data: episodeCrew, key: ({ person }) => person.tmdbId },
            {
              data: people,
              key: "tmdbId",
              select: (person, { episodeId }) => ({ episodeId, peopleId: person.id })
            }
          )
        )
        .skipDuplicates()
        .execute();

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

      await episodeCharacterDeleteQuery(tx)
        .where({ episodeId: { in: episodes.map((episode) => episode.id) } })
        .execute();
      await episodeCharacterInsertQuery(tx)
        .values(
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
          )
        )
        .skipDuplicates()
        .execute();

      return series;
    },
    {
      timeout: 30_000,
      maxWait: 5_000
    }
  );
}

import { seasonDetails } from "@/external/tmdb/tmdb.season-details.js";
import { tvDetails } from "@/external/tmdb/tmdb.tv-details.js";
import { prisma } from "@/shared/db/prisma.js";
import { characterRepository } from "../character/character.repository.js";
import { episodeRepository } from "../episode/episode.repository.js";
import { genreRepository } from "../genre/genre.repository.js";
import { networkRepository } from "../network/network.repository.js";
import { peopleRepository } from "../people/people.repository.js";
import { seasonRepository } from "../season/season.repository.js";
import { seriesRepository } from "./series.repository.js";
import type { SeriesGet, SeriesImportPost } from "./series.schemas.js";
import { dropKeys, getMany, joinBy } from "@/shared/utils/object/object.js";
import { Prisma } from "@/generated/prisma/client.js";
import type {
  TmdbEpisodeDetailsGuestStar,
  TmdbEpisodeDetailsResponse
} from "@/external/tmdb/tmdb.types.js";
import { notFound } from "@/shared/errors/errors.helpers.js";

export const seriesService = {
  async seriesGet(params: SeriesGet) {
    const series = await seriesRepository.findOne(params);

    if (!series) {
      throw notFound("Series");
    }

    const [seasons, episodes] = await Promise.all([
      seasonRepository.findMany({
        seriesId: series.id
      }),
      episodeRepository.findMany({
        seriesId: series.id
      })
    ]);

    return { series, seasons, episodes };
  },

  async seriesImportPost(body: SeriesImportPost) {
    const existingSeries = await seriesRepository.findOne(body);

    if (existingSeries) return existingSeries;

    const tmdbSeries = await tvDetails(body.tmdbId);
    const tmdbSeasons = await Promise.all(
      tmdbSeries.seasons.map((season) => seasonDetails(body.tmdbId, season.seasonNumber))
    );
    const tmdbEpisodes = getMany<TmdbEpisodeDetailsResponse>({
      data: tmdbSeasons,
      fields: ["episodes"]
    });

    return prisma.$transaction(async (tx) => {
      const series = await seriesRepository.upsert(
        { tmdbId: tmdbSeries.tmdbId },
        dropKeys(tmdbSeries, ["createdBy", "genres", "networks", "seasons"] as const),
        tx
      );

      const genres = await genreRepository.createMany(tmdbSeries.genres, tx);
      await seriesRepository.addGenres(
        series.id,
        genres.map((genre) => genre.id),
        tx
      );

      const networks = await networkRepository.createMany(tmdbSeries.networks, tx);
      await seriesRepository.addNetworks(
        series.id,
        networks.map((network) => network.id),
        tx
      );

      const people = await peopleRepository.createMany(
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

      await seriesRepository.addPeople(series.id, creatorIds, tx);

      const characters = await characterRepository.createMany(
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
          {
            data: people,
            key: "tmdbId",
            value: "id",
            as: "peopleId"
          }
        ),
        tx
      );

      const seasons = await seasonRepository.createMany(
        series.id,
        tmdbSeasons.map((season) => dropKeys(season, ["episodes"] as const)),
        tx
      );

      const episodes = await episodeRepository.createMany(
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

      await episodeRepository.addPeople(
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
        {
          data: tmdbEpisodes,
          key: "tmdbId",
          value: "guestStars",
          as: "guestStar"
        },
        {
          data: episodes,
          key: "tmdbId",
          value: "id",
          as: "episodeId"
        }
      );

      const episodeGuestStarsWithPeople = joinBy(
        { data: episodeGuestStars, key: ({ guestStar }) => guestStar.tmdbId },
        {
          data: people,
          key: "tmdbId",
          select: (person, episodeGuestStar) => ({ ...episodeGuestStar, peopleId: person.id })
        }
      );

      await episodeRepository.addCharacters(
        joinBy(
          {
            data: episodeGuestStarsWithPeople,
            key: ({ peopleId, guestStar }) => `${peopleId}:${guestStar.character}`
          },
          {
            data: characters,
            key: (character) => `${character.peopleId}:${character.name}`,
            select: (character, { episodeId }) => ({
              episodeId,
              characterId: character.id
            })
          }
        ),
        tx
      );

      return series;
    });
  }
};

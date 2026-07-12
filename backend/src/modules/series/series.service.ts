import {
  mapTmdbEpisode,
  mapTmdbPeople,
  mapTmdbSeason,
  mapTmdbSeries
} from "@/external/tmdb/tmdb.mappers.js";
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
import type { SeriesImport } from "./series.schemas.js";

export const seriesService = {
  async seriesImport(input: SeriesImport) {
    const existingSeries = await seriesRepository.findOne(input);

    if (existingSeries) return existingSeries;

    const tmdbSeries = await tvDetails(input.tmdbId);
    const tmdbSeasons = await Promise.all(
      tmdbSeries.seasons.map((season) => seasonDetails(input.tmdbId, season.seasonNumber))
    );
    const tmdbEpisodes = tmdbSeasons.flatMap((season) => season.episodes);

    return prisma.$transaction(async (tx) => {
      // Series
      const series = await seriesRepository.upsert(
        { tmdbId: tmdbSeries.tmdbId },
        mapTmdbSeries(tmdbSeries),
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
        [
          ...tmdbSeries.createdBy.map(mapTmdbPeople),
          ...tmdbEpisodes.flatMap((episode) => [
            ...episode.crew.map(mapTmdbPeople),
            ...episode.guestStars.map(mapTmdbPeople)
          ])
        ],
        tx
      );
      const peopleByTmdbId = new Map(people.map((person) => [person.tmdbId, person]));

      await seriesRepository.addPeople(
        series.id,
        tmdbSeries.createdBy.flatMap((person) => {
          const storedPerson = peopleByTmdbId.get(person.tmdbId);
          return storedPerson ? [storedPerson.id] : [];
        }),
        tx
      );

      const characters = await characterRepository.createMany(
        tmdbEpisodes.flatMap((episode) =>
          episode.guestStars.flatMap((guestStar) => {
            const person = peopleByTmdbId.get(guestStar.tmdbId);
            return person ? [{ peopleId: person.id, name: guestStar.character }] : [];
          })
        ),
        tx
      );
      const charactersByPersonAndName = new Map(
        characters.map((character) => [`${character.peopleId}:${character.name}`, character])
      );

      const seasons = await seasonRepository.createMany(
        series.id,
        tmdbSeasons.map(mapTmdbSeason),
        tx
      );
      const seasonsByTmdbId = new Map(seasons.map((season) => [season.tmdbId, season]));

      const episodes = await episodeRepository.createMany(
        tmdbSeasons.flatMap((tmdbSeason) => {
          const season = seasonsByTmdbId.get(tmdbSeason.tmdbId);
          if (!season) return [];

          return tmdbSeason.episodes.map((episode) => ({
            ...mapTmdbEpisode(episode),
            seriesId: series.id,
            seasonId: season.id
          }));
        }),
        tx
      );
      const episodesByTmdbId = new Map(episodes.map((episode) => [episode.tmdbId, episode]));

      await episodeRepository.addPeople(
        tmdbEpisodes.flatMap((tmdbEpisode) => {
          const episode = episodesByTmdbId.get(tmdbEpisode.tmdbId);
          if (!episode) return [];

          return tmdbEpisode.crew.flatMap((person) => {
            const storedPerson = peopleByTmdbId.get(person.tmdbId);
            return storedPerson ? [{ episodeId: episode.id, peopleId: storedPerson.id }] : [];
          });
        }),
        tx
      );

      await episodeRepository.addCharacters(
        tmdbEpisodes.flatMap((tmdbEpisode) => {
          const episode = episodesByTmdbId.get(tmdbEpisode.tmdbId);
          if (!episode) return [];

          return tmdbEpisode.guestStars.flatMap((guestStar) => {
            const person = peopleByTmdbId.get(guestStar.tmdbId);
            if (!person) return [];

            const character = charactersByPersonAndName.get(`${person.id}:${guestStar.character}`);
            return character ? [{ episodeId: episode.id, characterId: character.id }] : [];
          });
        }),
        tx
      );

      return series;
    });
  }
};

import { seasonDetails } from "@/external/tmdb/tmdb.season-details.js";
import { tvDetails } from "@/external/tmdb/tmdb.tv-details.js";
import { prisma } from "@/shared/db/prisma.js";
import { dropKeys } from "@/shared/utils/object.js";
import { characterRepository } from "../character/character.repository.js";
import { episodeRepository } from "../episode/episode.repository.js";
import { genreRepository } from "../genre/genre.repository.js";
import { networkRepository } from "../network/network.repository.js";
import { peopleRepository } from "../people/people.repository.js";
import { seasonRepository } from "../season/season.repository.js";
import { seriesRepository } from "./series.repository.js";
function toDate(value) {
    return value ? new Date(value) : null;
}
function mapPeople(people) {
    return {
        adult: people.adult,
        gender: people.gender,
        tmdbId: people.tmdbId,
        knownForDepartment: people.knownForDepartment,
        name: people.name,
        popularity: people.popularity,
        profilePath: people.profilePath,
    };
}
function mapSeries(series) {
    return {
        ...dropKeys(series, ["createdBy", "genres", "networks", "seasons"]),
        firstAirDate: toDate(series.firstAirDate),
        lastAirDate: toDate(series.lastAirDate),
    };
}
function mapSeason(season) {
    return {
        ...dropKeys(season, ["episodes"]),
        airDate: toDate(season.airDate),
    };
}
function mapEpisode(episode) {
    return {
        ...dropKeys(episode, ["crew", "guestStars"]),
        airDate: toDate(episode.airDate),
        runtime: episode.runtime ?? 0,
    };
}
export const seriesService = {
    async seriesImport(input) {
        const existingSeries = await seriesRepository.findOne(input);
        if (existingSeries)
            return existingSeries;
        const tmdbSeries = await tvDetails(input.tmdbId);
        const tmdbSeasons = await Promise.all(tmdbSeries.seasons.map((season) => seasonDetails(input.tmdbId, season.seasonNumber)));
        return prisma.$transaction(async (tx) => {
            const series = await seriesRepository.upsert({ tmdbId: tmdbSeries.tmdbId }, mapSeries(tmdbSeries), tx);
            const genres = await genreRepository.createMany(tmdbSeries.genres, tx);
            await seriesRepository.addGenres(series.id, genres.map((genre) => genre.id), tx);
            const networks = await networkRepository.createMany(tmdbSeries.networks, tx);
            await seriesRepository.addNetworks(series.id, networks.map((network) => network.id), tx);
            const allEpisodes = tmdbSeasons.flatMap((season) => season.episodes);
            const allPeople = await peopleRepository.createMany([
                ...tmdbSeries.createdBy.map(mapPeople),
                ...allEpisodes.flatMap((episode) => [
                    ...episode.crew.map(mapPeople),
                    ...episode.guestStars.map(mapPeople),
                ]),
            ], tx);
            const peopleByTmdbId = new Map(allPeople.map((people) => [people.tmdbId, people]));
            await seriesRepository.addPeople(series.id, tmdbSeries.createdBy.flatMap((people) => {
                const storedPeople = peopleByTmdbId.get(people.tmdbId);
                return storedPeople ? [storedPeople.id] : [];
            }), tx);
            const characters = await characterRepository.createMany(allEpisodes.flatMap((episode) => episode.guestStars.flatMap((guestStar) => {
                const people = peopleByTmdbId.get(guestStar.tmdbId);
                return people ? [{ peopleId: people.id, name: guestStar.character }] : [];
            })), tx);
            const characterByPeopleAndName = new Map(characters.map((character) => [`${character.peopleId}:${character.name}`, character]));
            for (const tmdbSeason of tmdbSeasons) {
                const season = await seasonRepository.upsert(series.id, mapSeason(tmdbSeason), tx);
                const episodes = await episodeRepository.upsertMany(series.id, season.id, tmdbSeason.episodes.map(mapEpisode), tx);
                const episodeByTmdbId = new Map(episodes.map((episode) => [episode.tmdbId, episode]));
                for (const tmdbEpisode of tmdbSeason.episodes) {
                    const episode = episodeByTmdbId.get(tmdbEpisode.tmdbId);
                    if (!episode)
                        continue;
                    await episodeRepository.addPeople(episode.id, tmdbEpisode.crew.flatMap((people) => {
                        const storedPeople = peopleByTmdbId.get(people.tmdbId);
                        return storedPeople ? [storedPeople.id] : [];
                    }), tx);
                    await episodeRepository.addCharacters(episode.id, tmdbEpisode.guestStars.flatMap((guestStar) => {
                        const people = peopleByTmdbId.get(guestStar.tmdbId);
                        if (!people)
                            return [];
                        const character = characterByPeopleAndName.get(`${people.id}:${guestStar.character}`);
                        return character ? [character.id] : [];
                    }), tx);
                }
            }
            return series;
        });
    },
};

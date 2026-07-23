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
import { dropKeys, getMany, joinBy } from "@/shared/utils/object/object.js";
import { notFound } from "@/shared/errors/errors.helpers.js";
import { userRepository } from "../user/user.repository.js";
export const seriesService = {
    async seriesGet(userId, params) {
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
    async seriesImportPost(userId, body) {
        const series = await seriesRepository.findOne(body);
        if (series) {
            const userSeries = await userRepository.findOneSeries({
                userId_seriesId: { userId, seriesId: series.id }
            });
            return { series, userSeries };
        }
        const tmdbSeries = await tvDetails(body.tmdbId);
        const tmdbSeasons = await Promise.all(tmdbSeries.seasons.map((season) => seasonDetails(body.tmdbId, season.seasonNumber)));
        const tmdbEpisodes = getMany({
            data: tmdbSeasons,
            fields: ["episodes"]
        });
        return prisma.$transaction(async (tx) => {
            const series = await seriesRepository.upsert({ tmdbId: tmdbSeries.tmdbId }, dropKeys(tmdbSeries, ["createdBy", "genres", "networks", "seasons"]), tx);
            const genres = await genreRepository.createMany(tmdbSeries.genres, tx);
            await seriesRepository.addGenres(series.id, genres.map((genre) => genre.id), tx);
            const networks = await networkRepository.createMany(tmdbSeries.networks, tx);
            await seriesRepository.addNetworks(series.id, networks.map((network) => network.id), tx);
            const people = await peopleRepository.createMany(getMany({ data: tmdbSeries, fields: ["createdBy"] }, { data: tmdbEpisodes, fields: ["crew", "guestStars"] }), tx);
            const creatorIds = joinBy({ data: tmdbSeries.createdBy, key: "tmdbId" }, { data: people, key: "tmdbId", value: "id" });
            await seriesRepository.addPeople(series.id, creatorIds, tx);
            const characters = await characterRepository.createMany(joinBy({
                data: getMany({
                    data: tmdbEpisodes,
                    fields: ["guestStars"]
                }),
                key: "tmdbId",
                value: "character",
                as: "name"
            }, {
                data: people,
                key: "tmdbId",
                value: "id",
                as: "peopleId"
            }), tx);
            const seasons = await seasonRepository.createMany(series.id, tmdbSeasons.map((season) => dropKeys(season, ["episodes"])), tx);
            const episodes = await episodeRepository.createMany(joinBy({ data: tmdbEpisodes, key: "seasonNumber" }, {
                data: seasons,
                key: "seasonNumber",
                select: (season, episode) => ({
                    ...dropKeys(episode, ["crew", "guestStars"]),
                    seriesId: series.id,
                    seasonId: season.id
                })
            }), tx);
            const episodeCrew = joinBy({ data: tmdbEpisodes, key: "tmdbId" }, {
                data: episodes,
                key: "tmdbId",
                select: (episode, tmdbEpisode) => tmdbEpisode.crew.map((person) => ({ episodeId: episode.id, person }))
            });
            await episodeRepository.addPeople(joinBy({ data: episodeCrew, key: ({ person }) => person.tmdbId }, {
                data: people,
                key: "tmdbId",
                select: (person, { episodeId }) => ({ episodeId, peopleId: person.id })
            }), tx);
            const episodeGuestStars = joinBy({
                data: tmdbEpisodes,
                key: "tmdbId",
                value: "guestStars",
                as: "guestStar"
            }, {
                data: episodes,
                key: "tmdbId",
                value: "id",
                as: "episodeId"
            });
            const episodeGuestStarsWithPeople = joinBy({ data: episodeGuestStars, key: ({ guestStar }) => guestStar.tmdbId }, {
                data: people,
                key: "tmdbId",
                select: (person, episodeGuestStar) => ({ ...episodeGuestStar, peopleId: person.id })
            });
            await episodeRepository.addCharacters(joinBy({
                data: episodeGuestStarsWithPeople,
                key: ({ peopleId, guestStar }) => `${peopleId}:${guestStar.character}`
            }, {
                data: characters,
                key: (character) => `${character.peopleId}:${character.name}`,
                select: (character, { episodeId }) => ({
                    episodeId,
                    characterId: character.id
                })
            }), tx);
            const userSeries = await userRepository.findOneSeries({
                userId_seriesId: { userId, seriesId: series.id }
            }, tx);
            return { series, userSeries };
        });
    }
};

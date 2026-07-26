import { prisma } from "../../shared/db/prisma.js";
import { userRepository } from "./user.repository.js";
import { renameKeys } from "../../shared/utils/object/object.js";
import { episodeRepository } from "../episode/episode.repository.js";
import { notFound } from "../../shared/errors/errors.helpers.js";
import { seriesRepository } from "../series/series.repository.js";
export const userService = {
    async userSeriesGet(userId, params) {
        const { status, limit, cursor } = params;
        const userSeries = await userRepository.findManySeries({ userId, status }, limit, cursor);
        const seriesDetails = await seriesRepository.findMany({
            id: { in: userSeries.items.map((series) => series.seriesId) }
        });
        const seriesById = new Map(seriesDetails.map((series) => [series.id, series]));
        const items = userSeries.items
            .map((series) => {
            const seriesDetails = seriesById.get(series.seriesId);
            return {
                ...series,
                seriesDetails
            };
        })
            .filter((item) => item !== null);
        return {
            items: items,
            hasNextPage: userSeries.hasNextPage,
            nextCursor: userSeries.nextCursor
        };
    },
    async userSeriesPost(userId, params, body) {
        const userSeries = await userRepository.upsertSeries({ userId_seriesId: { userId, ...params } }, { userId, ...params, ...body });
        return userSeries;
    },
    async userEpisodePost(userId, params) {
        return prisma.$transaction(async (tx) => {
            const { seriesId, episodeId } = params;
            const episode = await episodeRepository.findOne(renameKeys(params, { episodeId: "id" }), tx);
            if (!episode) {
                throw notFound("Episode");
            }
            await userRepository.upsertSeries({ userId_seriesId: { userId, seriesId } }, { userId, seriesId }, tx);
            return await userRepository.upsertEpisode({ userId_episodeId: { userId, episodeId } }, { userId, episodeId }, tx);
        });
    },
    async userEpisodeDelete(userId, params) {
        const { episodeId } = params;
        const episode = await episodeRepository.deleteMany({ userId, episodeId });
        return episode;
    }
};

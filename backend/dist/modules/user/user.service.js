import { prisma } from "../../shared/db/prisma.js";
import { userRepository } from "./user.repository.js";
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
    async userEpisodeFeedGet(userId) {
        const episodes = await userRepository.getEpisodesFeed(userId);
        return {
            watching: episodes.filter(({ status }) => status === "WATCHING"),
            paused: episodes.filter(({ status }) => status === "PAUSED"),
            dropped: episodes.filter(({ status }) => status === "DROPPED")
        };
    },
    async userSeriesPost(userId, params, body) {
        const userSeries = await userRepository.upsertSeries({ userId_seriesId: { userId, ...params } }, { userId, ...params, ...body }, {});
        return userSeries;
    },
    async userEpisodePost(userId, params) {
        const { seriesId, episodeId } = params;
        return prisma.$transaction(async (tx) => {
            const episode = await episodeRepository.findOne({ id: episodeId, seriesId }, tx);
            if (!episode) {
                throw notFound("Episode");
            }
            const series = await seriesRepository.findOne({ id: seriesId }, tx);
            if (!series) {
                throw notFound("Series");
            }
            const userSeries = await userRepository.findOneSeries({ userId_seriesId: { userId: userId, seriesId: seriesId } }, tx);
            const userEpisode = await userRepository.findOneEpisode({ userId_episodeId: { userId: userId, episodeId: episodeId } }, tx);
            if (userEpisode) {
                const nextEpisode = await userRepository.getEpisodeFeedItem(userId, seriesId, tx);
                return {
                    ...userEpisode,
                    seriesId,
                    nextEpisode
                };
            }
            const incrementedWatchcount = episode.seasonNumber !== 0
                ? (userSeries?.watchCount ?? 0) + 1
                : (userSeries?.watchCount ?? 0);
            const status = incrementedWatchcount >= series.numberOfEpisodes ? "COMPLETED" : "WATCHING";
            await userRepository.upsertSeries({ userId_seriesId: { userId, seriesId } }, { userId, seriesId, status, watchCount: incrementedWatchcount, lastWatchedAt: new Date() }, { status, watchCount: incrementedWatchcount, lastWatchedAt: new Date() }, tx);
            const createdUserEpisode = await userRepository.upsertEpisode({ userId_episodeId: { userId, episodeId } }, { userId, episodeId }, tx);
            const nextEpisode = await userRepository.getEpisodeFeedItem(userId, seriesId, tx);
            return {
                ...createdUserEpisode,
                seriesId,
                nextEpisode
            };
        });
    },
    async userEpisodeDelete(userId, params) {
        const { seriesId, episodeId } = params;
        return prisma.$transaction(async (tx) => {
            const episode = await episodeRepository.findOne({ id: episodeId, seriesId }, tx);
            if (!episode) {
                throw notFound("Episode");
            }
            const series = await seriesRepository.findOne({ id: seriesId }, tx);
            if (!series) {
                throw notFound("Series");
            }
            const userSeries = await userRepository.findOneSeries({ userId_seriesId: { userId: userId, seriesId: seriesId } }, tx);
            if (!userSeries) {
                throw notFound("Series for this user");
            }
            const userEpisode = await userRepository.findOneEpisode({ userId_episodeId: { userId: userId, episodeId: episodeId } }, tx);
            if (!userEpisode) {
                throw notFound("Episode for this user");
            }
            const decrementedWatchcount = episode.seasonNumber !== 0 ? userSeries.watchCount - 1 : userSeries.watchCount;
            const status = decrementedWatchcount === 0 ? "PLANNED" : "WATCHING";
            await userRepository.upsertSeries({ userId_seriesId: { userId, seriesId } }, { userId, seriesId, status, watchCount: decrementedWatchcount }, { status, watchCount: decrementedWatchcount }, tx);
            return userRepository.deleteManyEpisode({ userId, episodeId }, tx);
        });
    },
    async userSeasonPost(userId, params) {
        const { seriesId, seasonId } = params;
        return prisma.$transaction(async (tx) => {
            const episodes = await episodeRepository.findMany({ seriesId, seasonId }, tx);
            if (episodes.length === 0) {
                throw notFound("Episodes");
            }
            const series = await seriesRepository.findOne({ id: seriesId }, tx);
            if (!series) {
                throw notFound("Series");
            }
            const userSeries = await userRepository.findOneSeries({ userId_seriesId: { userId: userId, seriesId: seriesId } }, tx);
            const userEpisodes = await userRepository.findManyEpisodes({ userId, episodeId: { in: episodes.map((episode) => episode.id) } }, tx);
            const watchedEpisodeIds = new Set(userEpisodes.map((userEpisode) => userEpisode.episodeId));
            const notWatchedEpisodes = episodes.filter((episode) => !watchedEpisodeIds.has(episode.id));
            if (notWatchedEpisodes.length === 0) {
                return userEpisodes;
            }
            const incrementedWatchcount = episodes[0].seasonNumber !== 0
                ? (userSeries?.watchCount ?? 0) + notWatchedEpisodes.length
                : (userSeries?.watchCount ?? 0);
            const status = incrementedWatchcount >= series.numberOfEpisodes ? "COMPLETED" : "WATCHING";
            await userRepository.upsertSeries({ userId_seriesId: { userId, seriesId } }, { userId, seriesId, status, watchCount: incrementedWatchcount, lastWatchedAt: new Date() }, { status, watchCount: incrementedWatchcount, lastWatchedAt: new Date() }, tx);
            return userRepository.upsertManyEpisodes(notWatchedEpisodes.map((episode) => ({ userId, episodeId: episode.id })), tx);
        });
    },
    async userSeasonDelete(userId, params) {
        const { seriesId, seasonId } = params;
        return prisma.$transaction(async (tx) => {
            const episodes = await episodeRepository.findMany({ seriesId, seasonId }, tx);
            if (episodes.length === 0) {
                throw notFound("Episodes");
            }
            const series = await seriesRepository.findOne({ id: seriesId }, tx);
            if (!series) {
                throw notFound("Series");
            }
            const userSeries = await userRepository.findOneSeries({ userId_seriesId: { userId: userId, seriesId: seriesId } }, tx);
            if (!userSeries) {
                throw notFound("Series for this user");
            }
            const userEpisodes = await userRepository.findManyEpisodes({ userId, episodeId: { in: episodes.map((episode) => episode.id) } }, tx);
            if (userEpisodes.length === 0) {
                throw notFound("Episode for this user");
            }
            const decrementedWatchcount = episodes[0].seasonNumber !== 0
                ? (userSeries?.watchCount ?? 0) - userEpisodes.length
                : (userSeries?.watchCount ?? 0);
            const status = decrementedWatchcount === 0 ? "PLANNED" : "WATCHING";
            await userRepository.upsertSeries({ userId_seriesId: { userId, seriesId } }, { userId, seriesId, status, watchCount: decrementedWatchcount }, { status, watchCount: decrementedWatchcount }, tx);
            return userRepository.deleteManyEpisode({ userId, episodeId: { in: userEpisodes.map((userEpisode) => userEpisode.episodeId) } }, tx);
        });
    },
    async userDashboardSummaryGet(userId) {
        const summary = await userRepository.getDashboardSummary(userId);
        return summary;
    },
    async userStatusRecalculatePost(params, now = new Date()) {
        const inactiveSince = new Date(now);
        inactiveSince.setUTCMonth(inactiveSince.getUTCMonth() - 2);
        const result = await userRepository.updateManySeries({
            userId: params.userId,
            status: "WATCHING",
            lastWatchedAt: {
                lte: inactiveSince
            }
        }, {
            status: "DROPPED"
        });
        return {
            updatedCount: result.count
        };
    }
};

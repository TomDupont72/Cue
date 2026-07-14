import { prisma } from "@/shared/db/prisma.js";
import { userRepository } from "./user.repository.js";
import { UserEpisodePostParams, UserSeriesPostBody, UserSeriesPostParams } from "./user.schemas.js";
import { renameKeys } from "@/shared/utils/object/object.js";
import { episodeRepository } from "../episode/episode.repository.js";
import { notFound } from "@/shared/errors/errors.helpers.js";

export const userService = {
  async userSeriesPost(userId: string, params: UserSeriesPostParams, body: UserSeriesPostBody) {
    const userSeries = await userRepository.upsertSeries(
      { userId_seriesId: { userId, ...params } },
      { userId, ...params, ...body }
    );

    return userSeries;
  },

  async userEpisodePost(userId: string, params: UserEpisodePostParams) {
    return prisma.$transaction(async (tx) => {
      const { seriesId, episodeId } = params;

      const episode = await episodeRepository.findOne(renameKeys(params, { episodeId: "id" }), tx);

      if (!episode) {
        throw notFound("Episode");
      }

      await userRepository.upsertSeries(
        { userId_seriesId: { userId, seriesId } },
        { userId, seriesId },
        tx
      );

      return await userRepository.upsertEpisode(
        { userId_episodeId: { userId, episodeId } },
        { userId, episodeId },
        tx
      );
    });
  }
};

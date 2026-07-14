import { userRepository } from "./user.repository.js";
import { UserSeriesPostBody, UserSeriesPostParams } from "./user.schemas.js";

export const userService = {
  async userSeriesPost(userId: string, params: UserSeriesPostParams, body: UserSeriesPostBody) {
    const userSeries = await userRepository.upsertSeries(
      { userId_seriesId: { userId, ...params } },
      { userId, ...params, ...body }
    );

    return userSeries;
  }
};

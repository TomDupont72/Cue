import { Prisma, type UserEpisode } from "@/generated/prisma/client.js";
import type { UserEpisodeCreateManyInput } from "@/generated/prisma/models.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { notFound } from "@/shared/errors/errors.helpers.js";
import type { UserSeriesUpdate } from "./user.types.js";

export const userSeriesRepository = {
  async getBySeriesId(userId: string, seriesId: number, db: PrismaTx = prisma) {
    return db.userSeries.findUnique({ where: { userId_seriesId: { userId, seriesId } } });
  },

  async requireBySeriesId(userId: string, seriesId: number, db: PrismaTx = prisma) {
    const userSeries = await db.userSeries.findUnique({
      where: { userId_seriesId: { userId, seriesId } }
    });

    if (!userSeries) {
      throw notFound("USER_SERIES_NOT_FOUND", "Series for this user not found");
    }

    return userSeries;
  },

  async update(userId: string, seriesId: number, data: UserSeriesUpdate, db: PrismaTx = prisma) {
    return db.userSeries.update({
      where: { userId_seriesId: { userId, seriesId } },
      data
    });
  },

  async upsert(
    userId: string,
    seriesId: number,
    data: UserSeriesUpdate,
    addedAt: Date,
    db: PrismaTx = prisma
  ) {
    return db.userSeries.upsert({
      where: { userId_seriesId: { userId, seriesId } },
      create: { userId, seriesId, ...data, addedAt },
      update: data
    });
  },

  async updateProgress(
    userId: string,
    seriesId: number,
    watchedAt: Date | null,
    watchCountDelta: number,
    watchedEpisodeCountDelta: number,
    db: PrismaTx = prisma
  ) {
    return db.userSeries.update({
      where: { userId_seriesId: { userId, seriesId } },
      data: {
        lastWatchedAt: watchedAt,
        watchCount: { increment: watchCountDelta },
        watchedEpisodeCount: { increment: watchedEpisodeCountDelta }
      }
    });
  },

  async upsertProgress(
    userId: string,
    seriesId: number,
    watchedAt: Date | null,
    watchCountDelta: number,
    watchedEpisodeCountDelta: number,
    db: PrismaTx = prisma
  ) {
    return db.userSeries.upsert({
      where: { userId_seriesId: { userId, seriesId } },
      create: {
        userId,
        seriesId,
        addedAt: watchedAt ?? new Date(),
        lastWatchedAt: watchedAt,
        watchCount: watchCountDelta,
        watchedEpisodeCount: watchedEpisodeCountDelta
      },
      update: {
        lastWatchedAt: watchedAt,
        watchCount: { increment: watchCountDelta },
        watchedEpisodeCount: { increment: watchedEpisodeCountDelta }
      }
    });
  }
};

export const userEpisodeRepository = {
  async getByEpisodeId(userId: string, episodeId: number, db: PrismaTx = prisma) {
    return db.userEpisode.findUnique({ where: { userId_episodeId: { userId, episodeId } } });
  },

  async requireByEpisodeId(userId: string, episodeId: number, db: PrismaTx = prisma) {
    const userEpisode = await db.userEpisode.findUnique({
      where: { userId_episodeId: { userId, episodeId } }
    });

    if (!userEpisode) {
      throw notFound("USER_EPISODE_NOT_FOUND", "Episode for this user not found");
    }

    return userEpisode;
  },

  async listByEpisodeIds(userId: string, episodeIds: number[], db: PrismaTx = prisma) {
    return db.userEpisode.findMany({ where: { userId, episodeId: { in: episodeIds } } });
  },

  async listBySeriesId(userId: string, seriesId: number, db: PrismaTx = prisma) {
    return db.userEpisode.findMany({ where: { userId, episode: { seriesId } } });
  },

  async getLastWatchedAtBySeriesId(userId: string, seriesId: number, db: PrismaTx = prisma) {
    const userEpisodes = await db.userEpisode.aggregate({
      where: {
        userId,
        episode: {
          seriesId
        }
      },
      _max: {
        watchedAt: true
      }
    });

    return userEpisodes._max.watchedAt;
  },

  async create(userId: string, episodeId: number, watchedAt: Date, db: PrismaTx = prisma) {
    const [userEpisode] = await db.userEpisode.createManyAndReturn({
      data: { userId, episodeId, watchedAt },
      skipDuplicates: true
    });

    return userEpisode;
  },

  async createMany(episodes: UserEpisodeCreateManyInput[], db: PrismaTx = prisma) {
    return db.userEpisode.createManyAndReturn({
      data: episodes,
      skipDuplicates: true
    });
  },

  async delete(userId: string, episodeId: number, db: PrismaTx = prisma) {
    return db.userEpisode.delete({ where: { userId_episodeId: { userId, episodeId } } });
  },

  async deleteMany(userId: string, episodeIds: number[], db: PrismaTx = prisma) {
    if (episodeIds.length === 0) {
      return [];
    }

    return db.$queryRaw<UserEpisode[]>(Prisma.sql`
      DELETE FROM "UserEpisode"
      WHERE "userId" = ${userId}
        AND "episodeId" IN (${Prisma.join(episodeIds)})
      RETURNING "userId", "episodeId", "watchedAt"
    `);
  }
};

import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { notFound } from "@/shared/errors/errors.helpers.js";
import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export const episodeRepository = {
  async upsertMany(data: readonly Prisma.EpisodeUncheckedCreateInput[], db: PrismaTx = prisma) {
    return upsertManyAndFetch({
      data,
      scalarFields: Prisma.EpisodeScalarFieldEnum,
      uniqueBy: "tmdbId",
      delegate: db.episode
    });
  },

  async listBySeriesId(seriesId: number, db: PrismaTx = prisma) {
    return db.episode.findMany({ where: { seriesId } });
  },

  async getById(id: number, seriesId: number, db: PrismaTx = prisma) {
    return db.episode.findUnique({ where: { id, seriesId } });
  },

  async requireById(id: number, seriesId: number, db: PrismaTx = prisma) {
    const episode = await db.episode.findUnique({ where: { id, seriesId } });

    if (!episode) {
      throw notFound("EPISODE_NOT_FOUND", "Episode not found");
    }

    return episode;
  },

  async getReleasedById(id: number, seriesId: number, date: Date, db: PrismaTx = prisma) {
    return db.episode.findUnique({ where: { id, seriesId, airDate: { lt: date } } });
  },

  async requireReleasedById(id: number, seriesId: number, date: Date, db: PrismaTx = prisma) {
    const episode = await db.episode.findUnique({
      where: { id, seriesId, airDate: { lt: date } }
    });

    if (!episode) {
      throw notFound("EPISODE_NOT_FOUND", "Episode not found");
    }

    return episode;
  },

  async listBySeasonId(seasonId: number, seriesId: number, db: PrismaTx = prisma) {
    return db.episode.findMany({ where: { seasonId, seriesId } });
  },

  async listNotEmptyBySeasonId(seasonId: number, seriesId: number, db: PrismaTx = prisma) {
    const episodes = await db.episode.findMany({ where: { seasonId, seriesId } });

    if (episodes.length === 0) {
      throw notFound("EPISODE_NOT_FOUND", "Episode not found");
    }

    return episodes;
  },

  async listReleasedBySeasonId(
    seasonId: number,
    seriesId: number,
    date: Date,
    db: PrismaTx = prisma
  ) {
    return db.episode.findMany({ where: { seasonId, seriesId, airDate: { lt: date } } });
  },

  async listNotEmptyReleasedBySeasonId(
    seasonId: number,
    seriesId: number,
    date: Date,
    db: PrismaTx = prisma
  ) {
    const episodes = await db.episode.findMany({
      where: { seasonId, seriesId, airDate: { lt: date } }
    });

    if (episodes.length === 0) {
      throw notFound("EPISODE_NOT_FOUND", "Episode not found");
    }

    return episodes;
  }
};

export const episodePeopleRepository = {
  async replaceByEpisodeIds(
    episodeIds: readonly number[],
    links: readonly Prisma.EpisodePeopleCreateManyInput[],
    db: PrismaTx = prisma
  ) {
    await db.episodePeople.deleteMany({ where: { episodeId: { in: [...episodeIds] } } });

    if (links.length > 0) {
      await db.episodePeople.createMany({ data: [...links], skipDuplicates: true });
    }
  }
};

export const episodeCharacterRepository = {
  async replaceByEpisodeIds(
    episodeIds: readonly number[],
    links: readonly Prisma.EpisodeCharacterCreateManyInput[],
    db: PrismaTx = prisma
  ) {
    await db.episodeCharacter.deleteMany({ where: { episodeId: { in: [...episodeIds] } } });

    if (links.length > 0) {
      await db.episodeCharacter.createMany({ data: [...links], skipDuplicates: true });
    }
  }
};

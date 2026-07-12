import type { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";

export const episodeRepository = {
  async createMany(episodes: Prisma.EpisodeUncheckedCreateInput[], db: PrismaTx = prisma) {
    await db.episode.createMany({
      data: episodes,
      skipDuplicates: true
    });

    return db.episode.findMany({
      where: {
        tmdbId: { in: episodes.map((episode) => episode.tmdbId) }
      }
    });
  },

  addPeople(data: Prisma.EpisodePeopleCreateManyInput[], db: PrismaTx = prisma) {
    return db.episodePeople.createMany({
      data,
      skipDuplicates: true
    });
  },

  addCharacters(data: Prisma.EpisodeCharacterCreateManyInput[], db: PrismaTx = prisma) {
    return db.episodeCharacter.createMany({
      data,
      skipDuplicates: true
    });
  }
};

import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export const episodeRepository = {
  findOne(where: Prisma.EpisodeWhereUniqueInput, db: PrismaTx = prisma) {
    return db.episode.findUnique({
      where
    });
  },

  findMany(where: Prisma.EpisodeWhereInput, db: PrismaTx = prisma) {
    return db.episode.findMany({
      where
    });
  },

  async upsertMany(episodes: Prisma.EpisodeUncheckedCreateInput[], db: PrismaTx = prisma) {
    return upsertManyAndFetch({
      data: episodes,
      scalarFields: Prisma.EpisodeScalarFieldEnum,
      uniqueBy: "tmdbId",
      delegate: db.episode
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
  },

  async replacePeople(
    episodeIds: number[],
    data: Prisma.EpisodePeopleCreateManyInput[],
    db: PrismaTx = prisma
  ) {
    await db.episodePeople.deleteMany({ where: { episodeId: { in: episodeIds } } });
    return this.addPeople(data, db);
  },

  async replaceCharacters(
    episodeIds: number[],
    data: Prisma.EpisodeCharacterCreateManyInput[],
    db: PrismaTx = prisma
  ) {
    await db.episodeCharacter.deleteMany({ where: { episodeId: { in: episodeIds } } });
    return this.addCharacters(data, db);
  }
};

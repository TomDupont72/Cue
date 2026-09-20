import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { SelectQuery } from "@/shared/db/selectQuery.js";
import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";
import { DeleteQuery } from "@/shared/db/deleteQuery.js";
import {
  episodeTable,
  episodeCharacterTable,
  episodePeopleTable
} from "@/shared/db/constants/queryTables.js";
import { RelationalSelectQuery } from "@/shared/db/relationalSelectQuery.js";

export const episodeSelectQuery = (db: PrismaTx = prisma) =>
  new SelectQuery<typeof db.episode>(db.episode, "EPISODE_NOT_FOUND");

export const episodeRelationalSelectQuery = (db: PrismaTx = prisma) =>
  new RelationalSelectQuery(db.episode, db, episodeTable);

const episodePeopleDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.episodePeople, db, episodePeopleTable);

const episodeCharacterDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.episodeCharacter, db, episodeCharacterTable);

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
    await episodePeopleDeleteQuery(db)
      .where({ episodeId: { in: episodeIds } })
      .execute();
    return this.addPeople(data, db);
  },

  async replaceCharacters(
    episodeIds: number[],
    data: Prisma.EpisodeCharacterCreateManyInput[],
    db: PrismaTx = prisma
  ) {
    await episodeCharacterDeleteQuery(db)
      .where({ episodeId: { in: episodeIds } })
      .execute();
    return this.addCharacters(data, db);
  }
};

import { Prisma, type Episode } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { SelectQuery } from "@/shared/db/selectQuery.js";
import { DeleteQuery } from "@/shared/db/deleteQuery.js";
import { InsertQuery } from "@/shared/db/insertQuery.js";
import { UpsertManyQuery } from "@/shared/db/upsertManyQuery.js";
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

export const episodeUpsertManyQuery = (db: PrismaTx = prisma) =>
  new UpsertManyQuery<Prisma.EpisodeUncheckedCreateInput, "tmdbId", Episode>({
    scalarFields: Prisma.EpisodeScalarFieldEnum,
    uniqueBy: "tmdbId",
    delegate: db.episode
  });

export const episodePeopleInsertQuery = (db: PrismaTx = prisma) =>
  new InsertQuery<typeof db.episodePeople>(db.episodePeople);

export const episodePeopleDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.episodePeople, db, episodePeopleTable);

export const episodeCharacterInsertQuery = (db: PrismaTx = prisma) =>
  new InsertQuery<typeof db.episodeCharacter>(db.episodeCharacter);

export const episodeCharacterDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.episodeCharacter, db, episodeCharacterTable);

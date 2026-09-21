import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { Prisma } from "@/generated/prisma/client.js";
import { SelectQuery } from "@/shared/db/selectQuery.js";
import { InsertQuery } from "@/shared/db/insertQuery.js";
import { DeleteQuery } from "@/shared/db/deleteQuery.js";
import { UpsertQuery } from "@/shared/db/upsertQuery.js";
import { UpdateQuery } from "@/shared/db/updateQuery.js";
import {
  seriesGenreTable,
  seriesNetworkTable,
  seriesPeopleTable
} from "@/shared/db/constants/queryTables.js";

export const seriesSelectQuery = (db: PrismaTx = prisma) =>
  new SelectQuery<typeof db.series>(db.series, "SERIES_NOT_FOUND");

export const seriesUpsertQuery = (db: PrismaTx = prisma) =>
  new UpsertQuery<typeof db.series>(db.series);

export const seriesUpdateQuery = (db: PrismaTx = prisma) =>
  new UpdateQuery<typeof db.series>(db.series);

const seriesGenreInsertQuery = (db: PrismaTx = prisma) =>
  new InsertQuery<typeof db.seriesGenre>(db.seriesGenre);

const seriesGenreDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.seriesGenre, db, seriesGenreTable);

const seriesNetworkInsertQuery = (db: PrismaTx = prisma) =>
  new InsertQuery<typeof db.seriesNetwork>(db.seriesNetwork);

const seriesNetworkDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.seriesNetwork, db, seriesNetworkTable);

const seriesPeopleInsertQuery = (db: PrismaTx = prisma) =>
  new InsertQuery<typeof db.seriesPeople>(db.seriesPeople);

const seriesPeopleDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.seriesPeople, db, seriesPeopleTable);

export const seriesRepository = {
  findOne(where: Prisma.SeriesWhereUniqueInput, db: PrismaTx = prisma) {
    return db.series.findUnique({
      where
    });
  },

  findMany(where: Prisma.SeriesWhereInput, db: PrismaTx = prisma) {
    return db.series.findMany({
      where
    });
  },

  upsert(
    where: Prisma.SeriesWhereUniqueInput,
    data: Prisma.SeriesCreateInput,
    db: PrismaTx = prisma
  ) {
    return seriesUpsertQuery(db).where(where).create(data).update(data).first();
  },

  async addGenres(seriesId: number, genreIds: number[], db: PrismaTx = prisma) {
    await seriesGenreInsertQuery(db)
      .values(genreIds.map((genreId) => ({ seriesId, genreId })))
      .skipDuplicates()
      .execute();
  },

  async addNetworks(seriesId: number, networkIds: number[], db: PrismaTx = prisma) {
    await seriesNetworkInsertQuery(db)
      .values(networkIds.map((networkId) => ({ seriesId, networkId })))
      .skipDuplicates()
      .execute();
  },

  async addPeople(seriesId: number, peopleIds: number[], db: PrismaTx = prisma) {
    await seriesPeopleInsertQuery(db)
      .values(peopleIds.map((peopleId) => ({ seriesId, peopleId })))
      .skipDuplicates()
      .execute();
  },

  async replaceGenres(seriesId: number, genreIds: number[], db: PrismaTx = prisma) {
    await seriesGenreDeleteQuery(db).where({ seriesId }).execute();
    return this.addGenres(seriesId, genreIds, db);
  },

  async replaceNetworks(seriesId: number, networkIds: number[], db: PrismaTx = prisma) {
    await seriesNetworkDeleteQuery(db).where({ seriesId }).execute();
    return this.addNetworks(seriesId, networkIds, db);
  },

  async replacePeople(seriesId: number, peopleIds: number[], db: PrismaTx = prisma) {
    await seriesPeopleDeleteQuery(db).where({ seriesId }).execute();
    return this.addPeople(seriesId, peopleIds, db);
  }
};

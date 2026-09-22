import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { SelectQuery } from "@/shared/db/selectQuery.js";
import { InsertQuery } from "@/shared/db/insertQuery.js";
import { DeleteQuery } from "@/shared/db/deleteQuery.js";
import { UpsertQuery } from "@/shared/db/upsertQuery.js";
import { UpdateQuery } from "@/shared/db/updateQuery.js";
import {
  seriesGenreTable,
  seriesNetworkTable,
  seriesPeopleTable,
  seriesProviderTable
} from "@/shared/db/constants/queryTables.js";

export const seriesSelectQuery = (db: PrismaTx = prisma) =>
  new SelectQuery<typeof db.series>(db.series, "SERIES_NOT_FOUND");

export const seriesUpsertQuery = (db: PrismaTx = prisma) =>
  new UpsertQuery<typeof db.series>(db.series);

export const seriesUpdateQuery = (db: PrismaTx = prisma) =>
  new UpdateQuery<typeof db.series>(db.series);

export const seriesGenreInsertQuery = (db: PrismaTx = prisma) =>
  new InsertQuery<typeof db.seriesGenre>(db.seriesGenre);

export const seriesGenreDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.seriesGenre, db, seriesGenreTable);

export const seriesNetworkInsertQuery = (db: PrismaTx = prisma) =>
  new InsertQuery<typeof db.seriesNetwork>(db.seriesNetwork);

export const seriesNetworkDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.seriesNetwork, db, seriesNetworkTable);

export const seriesPeopleInsertQuery = (db: PrismaTx = prisma) =>
  new InsertQuery<typeof db.seriesPeople>(db.seriesPeople);

export const seriesPeopleDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.seriesPeople, db, seriesPeopleTable);

export const seriesProviderInsertQuery = (db: PrismaTx = prisma) =>
  new InsertQuery<typeof db.seriesProvider>(db.seriesProvider);

export const seriesProviderDeleteQuery = (db: PrismaTx = prisma) =>
  new DeleteQuery(db.seriesProvider, db, seriesProviderTable);

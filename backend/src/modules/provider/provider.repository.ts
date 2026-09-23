import { Prisma } from "@/generated/prisma/client.js";
import { providerTable } from "@/shared/db/constants/queryTables.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { RelationalSelectQuery } from "@/shared/db/relationalSelectQuery.js";
import { UpsertQuery } from "@/shared/db/upsertQuery.js";

export const providerRelationalSelectQuery = (db: PrismaTx = prisma) =>
  new RelationalSelectQuery(db.provider, db, providerTable);

export const providerUpsertQuery = (db: PrismaTx = prisma) =>
  new UpsertQuery<typeof db.provider, Prisma.ProviderCreateManyInput, "tmdbId">(db.provider, {
    scalarFields: Prisma.ProviderScalarFieldEnum,
    uniqueBy: "tmdbId"
  });

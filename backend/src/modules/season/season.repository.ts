import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { SelectQuery } from "@/shared/db/selectQuery.js";
import { UpsertQuery } from "@/shared/db/upsertQuery.js";

export const seasonsSelectQuery = (db: PrismaTx = prisma) =>
  new SelectQuery<typeof db.season>(db.season, "SEASON_NOT_FOUND");

export const seasonUpsertQuery = (db: PrismaTx = prisma) =>
  new UpsertQuery<typeof db.season, Prisma.SeasonUncheckedCreateInput, "tmdbId">(db.season, {
    scalarFields: Prisma.SeasonScalarFieldEnum,
    uniqueBy: "tmdbId"
  });

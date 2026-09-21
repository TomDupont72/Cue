import { Prisma, type Season } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { SelectQuery } from "@/shared/db/selectQuery.js";
import { UpsertManyQuery } from "@/shared/db/upsertManyQuery.js";

export const seasonsSelectQuery = (db: PrismaTx = prisma) =>
  new SelectQuery<typeof db.season>(db.season, "SEASON_NOT_FOUND");

export const seasonUpsertManyQuery = (db: PrismaTx = prisma) =>
  new UpsertManyQuery<Prisma.SeasonUncheckedCreateInput, "tmdbId", Season>({
    scalarFields: Prisma.SeasonScalarFieldEnum,
    uniqueBy: "tmdbId",
    delegate: db.season
  });

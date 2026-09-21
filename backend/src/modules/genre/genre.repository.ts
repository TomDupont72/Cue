import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { UpsertQuery } from "@/shared/db/upsertQuery.js";

export const genreUpsertQuery = (db: PrismaTx = prisma) =>
  new UpsertQuery<typeof db.genre, Prisma.GenreCreateManyInput, "tmdbId">(db.genre, {
    scalarFields: Prisma.GenreScalarFieldEnum,
    uniqueBy: "tmdbId"
  });

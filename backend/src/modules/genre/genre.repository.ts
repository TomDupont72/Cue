import { Prisma, type Genre } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { UpsertManyQuery } from "@/shared/db/upsertManyQuery.js";

export const genreUpsertManyQuery = (db: PrismaTx = prisma) =>
  new UpsertManyQuery<Prisma.GenreCreateManyInput, "tmdbId", Genre>({
    scalarFields: Prisma.GenreScalarFieldEnum,
    uniqueBy: "tmdbId",
    delegate: db.genre
  });

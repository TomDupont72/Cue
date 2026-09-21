import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { UpsertQuery } from "@/shared/db/upsertQuery.js";

export const networkUpsertQuery = (db: PrismaTx = prisma) =>
  new UpsertQuery<typeof db.network, Prisma.NetworkCreateManyInput, "tmdbId">(db.network, {
    scalarFields: Prisma.NetworkScalarFieldEnum,
    uniqueBy: "tmdbId"
  });

import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { UpsertQuery } from "@/shared/db/upsertQuery.js";

export const providerUpsertQuery = (db: PrismaTx = prisma) =>
  new UpsertQuery<typeof db.provider, Prisma.ProviderCreateManyInput, "tmdbId">(db.provider, {
    scalarFields: Prisma.ProviderScalarFieldEnum,
    uniqueBy: "tmdbId"
  });

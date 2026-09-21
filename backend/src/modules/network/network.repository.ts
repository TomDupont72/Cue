import { Prisma, type Network } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { UpsertManyQuery } from "@/shared/db/upsertManyQuery.js";

export const networkUpsertManyQuery = (db: PrismaTx = prisma) =>
  new UpsertManyQuery<Prisma.NetworkCreateManyInput, "tmdbId", Network>({
    scalarFields: Prisma.NetworkScalarFieldEnum,
    uniqueBy: "tmdbId",
    delegate: db.network
  });

import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { UpsertQuery } from "@/shared/db/upsertQuery.js";

export const peopleUpsertQuery = (db: PrismaTx = prisma) =>
  new UpsertQuery<typeof db.people, Prisma.PeopleCreateManyInput, "tmdbId">(db.people, {
    scalarFields: Prisma.PeopleScalarFieldEnum,
    uniqueBy: "tmdbId"
  });

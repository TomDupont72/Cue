import { Prisma, type People } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { UpsertManyQuery } from "@/shared/db/upsertManyQuery.js";

export const peopleUpsertManyQuery = (db: PrismaTx = prisma) =>
  new UpsertManyQuery<Prisma.PeopleCreateManyInput, "tmdbId", People>({
    scalarFields: Prisma.PeopleScalarFieldEnum,
    uniqueBy: "tmdbId",
    delegate: db.people
  });

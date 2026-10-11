import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export function upsertPeople(data: readonly Prisma.PeopleCreateManyInput[], db: PrismaTx = prisma) {
  return upsertManyAndFetch({
    data,
    scalarFields: Prisma.PeopleScalarFieldEnum,
    uniqueBy: "tmdbId",
    delegate: db.people
  });
}

import { Prisma, type Character } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { CreateManyAndFetchQuery } from "@/shared/db/createManyAndFetchQuery.js";

export const characterCreateManyAndFetchQuery = (db: PrismaTx = prisma) =>
  new CreateManyAndFetchQuery<
    Prisma.CharacterCreateManyInput,
    Prisma.CharacterCreateManyInput,
    readonly ["peopleId", "name"],
    Character
  >({
    scalarFields: Prisma.CharacterScalarFieldEnum,
    uniqueBy: ["peopleId", "name"],
    delegate: db.character
  });

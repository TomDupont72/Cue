import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { InsertQuery } from "@/shared/db/insertQuery.js";

export const characterInsertQuery = (db: PrismaTx = prisma) =>
  new InsertQuery<
    typeof db.character,
    false,
    Prisma.CharacterCreateManyInput,
    Prisma.CharacterCreateManyInput,
    readonly ["peopleId", "name"]
  >(db.character, {
    scalarFields: Prisma.CharacterScalarFieldEnum,
    uniqueBy: ["peopleId", "name"]
  });

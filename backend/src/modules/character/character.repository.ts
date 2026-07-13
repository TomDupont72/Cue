import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { createManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export const characterRepository = {
  async createMany(data: Prisma.CharacterCreateManyInput[], db: PrismaTx = prisma) {
    return createManyAndFetch({
      data,
      scalarFields: Prisma.CharacterScalarFieldEnum,
      uniqueBy: ["peopleId", "name"] as const,
      delegate: db.character
    });
  }
};

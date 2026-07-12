import type { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";

export const characterRepository = {
  async createMany(data: Prisma.CharacterCreateManyInput[], db: PrismaTx = prisma) {
    const uniqueCharacters = [
      ...new Map(
        data.map((character) => [`${character.peopleId}:${character.name}`, character])
      ).values()
    ];

    await db.character.createMany({ data: uniqueCharacters, skipDuplicates: true });

    return db.character.findMany({
      where: {
        OR: uniqueCharacters.map(({ peopleId, name }) => ({ peopleId, name }))
      }
    });
  }
};

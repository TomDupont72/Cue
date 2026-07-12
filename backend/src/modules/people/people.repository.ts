import type { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";

export const peopleRepository = {
  async createMany(data: Prisma.PeopleCreateManyInput[], db: PrismaTx = prisma) {
    const uniquePeople = [...new Map(data.map((people) => [people.tmdbId, people])).values()];

    await db.people.createMany({ data: uniquePeople, skipDuplicates: true });

    return db.people.findMany({
      where: { tmdbId: { in: uniquePeople.map((people) => people.tmdbId) } }
    });
  }
};

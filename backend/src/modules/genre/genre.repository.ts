import type { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";

export const genreRepository = {
  async createMany(data: Prisma.GenreCreateManyInput[], db: PrismaTx = prisma) {
    await db.genre.createMany({ data, skipDuplicates: true });

    return db.genre.findMany({
      where: { tmdbId: { in: data.map((genre) => genre.tmdbId) } }
    });
  }
};

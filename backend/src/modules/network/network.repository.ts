import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";

export const networkRepository = {
    async createMany(
        data: Prisma.NetworkCreateInput[],
        db: PrismaTx = prisma
    ) {
        await db.network.createMany({
      data: data,
      skipDuplicates: true
    });

    return db.network.findMany({
      where: {
        tmdbId: {
          in: data.map((network) => network.tmdbId),
        },
      },
    });
  }
};
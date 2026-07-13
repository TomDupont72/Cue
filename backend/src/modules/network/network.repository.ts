import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { createManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export const networkRepository = {
  async createMany(data: Prisma.NetworkCreateManyInput[], db: PrismaTx = prisma) {
    return createManyAndFetch({
      data,
      scalarFields: Prisma.NetworkScalarFieldEnum,
      uniqueBy: "tmdbId",
      delegate: db.network
    });
  }
};

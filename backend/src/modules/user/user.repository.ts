import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";

export const userRepository = {
  findOneSeries(where: Prisma.UserSeriesWhereUniqueInput, db: PrismaTx = prisma) {
    return db.userSeries.findUnique({
      where
    });
  },

  upsertSeries(
    where: Prisma.UserSeriesWhereUniqueInput,
    data: Prisma.UserSeriesUncheckedCreateInput,
    db: PrismaTx = prisma
  ) {
    return db.userSeries.upsert({
      where,
      create: data,
      update: data
    });
  }
};

import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { createManyAndFetch } from "@/shared/utils/prisma/prisma.js";
export const seasonRepository = {
    findMany(where, db = prisma) {
        return db.season.findMany({
            where
        });
    },
    async createMany(seriesId, data, db = prisma) {
        return createManyAndFetch({
            data: data.map((season) => ({ ...season, seriesId })),
            scalarFields: Prisma.SeasonScalarFieldEnum,
            uniqueBy: "tmdbId",
            delegate: db.season
        });
    }
};

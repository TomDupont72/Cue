import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../shared/db/prisma.js";
import { upsertManyAndFetch } from "../../shared/utils/prisma/prisma.js";
export const seasonRepository = {
    findMany(where, db = prisma) {
        return db.season.findMany({
            where
        });
    },
    async upsertMany(seriesId, data, db = prisma) {
        return upsertManyAndFetch({
            data: data.map((season) => ({ ...season, seriesId })),
            scalarFields: Prisma.SeasonScalarFieldEnum,
            uniqueBy: "tmdbId",
            delegate: db.season
        });
    }
};

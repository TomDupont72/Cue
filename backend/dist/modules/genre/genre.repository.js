import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../shared/db/prisma.js";
import { upsertManyAndFetch } from "../../shared/utils/prisma/prisma.js";
export const genreRepository = {
    async upsertMany(data, db = prisma) {
        return upsertManyAndFetch({
            data,
            scalarFields: Prisma.GenreScalarFieldEnum,
            uniqueBy: "tmdbId",
            delegate: db.genre
        });
    }
};

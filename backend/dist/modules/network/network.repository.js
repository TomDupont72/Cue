import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../shared/db/prisma.js";
import { upsertManyAndFetch } from "../../shared/utils/prisma/prisma.js";
export const networkRepository = {
    async upsertMany(data, db = prisma) {
        return upsertManyAndFetch({
            data,
            scalarFields: Prisma.NetworkScalarFieldEnum,
            uniqueBy: "tmdbId",
            delegate: db.network
        });
    }
};

import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../shared/db/prisma.js";
import { createManyAndFetch } from "../../shared/utils/prisma/prisma.js";
export const networkRepository = {
    async createMany(data, db = prisma) {
        return createManyAndFetch({
            data,
            scalarFields: Prisma.NetworkScalarFieldEnum,
            uniqueBy: "tmdbId",
            delegate: db.network
        });
    }
};

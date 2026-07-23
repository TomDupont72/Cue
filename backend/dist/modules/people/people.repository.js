import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../shared/db/prisma.js";
import { createManyAndFetch } from "../../shared/utils/prisma/prisma.js";
export const peopleRepository = {
    async createMany(data, db = prisma) {
        return createManyAndFetch({
            data,
            scalarFields: Prisma.PeopleScalarFieldEnum,
            uniqueBy: "tmdbId",
            delegate: db.people
        });
    }
};

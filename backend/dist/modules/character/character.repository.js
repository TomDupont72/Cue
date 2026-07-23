import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../shared/db/prisma.js";
import { createManyAndFetch } from "../../shared/utils/prisma/prisma.js";
export const characterRepository = {
    async createMany(data, db = prisma) {
        return createManyAndFetch({
            data,
            scalarFields: Prisma.CharacterScalarFieldEnum,
            uniqueBy: ["peopleId", "name"],
            delegate: db.character
        });
    }
};

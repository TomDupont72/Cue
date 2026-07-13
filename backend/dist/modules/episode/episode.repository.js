import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { createManyAndFetch } from "@/shared/utils/prisma/prisma.js";
export const episodeRepository = {
    async createMany(episodes, db = prisma) {
        return createManyAndFetch({
            data: episodes,
            scalarFields: Prisma.EpisodeScalarFieldEnum,
            uniqueBy: "tmdbId",
            delegate: db.episode
        });
    },
    addPeople(data, db = prisma) {
        return db.episodePeople.createMany({
            data,
            skipDuplicates: true
        });
    },
    addCharacters(data, db = prisma) {
        return db.episodeCharacter.createMany({
            data,
            skipDuplicates: true
        });
    }
};

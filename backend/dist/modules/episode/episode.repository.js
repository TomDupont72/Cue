import { prisma } from "@/shared/db/prisma.js";
export const episodeRepository = {
    upsertMany(seriesId, seasonId, episodes, db = prisma) {
        return Promise.all(episodes.map((episode) => db.episode.upsert({
            where: { tmdbId: episode.tmdbId },
            create: { ...episode, seriesId, seasonId },
            update: { ...episode, seriesId, seasonId },
        })));
    },
    addPeople(episodeId, peopleIds, db = prisma) {
        return db.episodePeople.createMany({
            data: peopleIds.map((peopleId) => ({ episodeId, peopleId })),
            skipDuplicates: true,
        });
    },
    addCharacters(episodeId, characterIds, db = prisma) {
        return db.episodeCharacter.createMany({
            data: characterIds.map((characterId) => ({ episodeId, characterId })),
            skipDuplicates: true,
        });
    },
};

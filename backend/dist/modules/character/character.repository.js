import { prisma } from "@/shared/db/prisma.js";
export const characterRepository = {
    async createMany(data, db = prisma) {
        const uniqueCharacters = [
            ...new Map(data.map((character) => [`${character.peopleId}:${character.name}`, character])).values(),
        ];
        await db.character.createMany({ data: uniqueCharacters, skipDuplicates: true });
        return db.character.findMany({
            where: {
                OR: uniqueCharacters.map(({ peopleId, name }) => ({ peopleId, name })),
            },
        });
    },
};

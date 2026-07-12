import { prisma } from "@/shared/db/prisma.js";
export const peopleRepository = {
    async createMany(data, db = prisma) {
        const uniquePeople = [...new Map(data.map((people) => [people.tmdbId, people])).values()];
        await db.people.createMany({ data: uniquePeople, skipDuplicates: true });
        return db.people.findMany({
            where: { tmdbId: { in: uniquePeople.map((people) => people.tmdbId) } },
        });
    },
};

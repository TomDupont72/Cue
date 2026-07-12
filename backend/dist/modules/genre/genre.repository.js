import { prisma } from "@/shared/db/prisma.js";
export const genreRepository = {
    async createMany(data, db = prisma) {
        await db.genre.createMany({ data, skipDuplicates: true });
        return db.genre.findMany({
            where: { tmdbId: { in: data.map((genre) => genre.tmdbId) } },
        });
    },
};

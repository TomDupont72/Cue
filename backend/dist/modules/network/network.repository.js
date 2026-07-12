import { prisma } from "@/shared/db/prisma.js";
export const networkRepository = {
    async createMany(data, db = prisma) {
        await db.network.createMany({
            data: data,
            skipDuplicates: true
        });
        return db.network.findMany({
            where: {
                tmdbId: {
                    in: data.map((network) => network.tmdbId),
                },
            },
        });
    }
};

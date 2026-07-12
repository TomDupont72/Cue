import { prisma } from "@/shared/db/prisma.js";
export const seasonRepository = {
    upsert(seriesId, data, db = prisma) {
        return db.season.upsert({
            where: { tmdbId: data.tmdbId },
            create: { ...data, seriesId },
            update: data,
        });
    },
};

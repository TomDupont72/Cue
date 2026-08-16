import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { Prisma } from "@/generated/prisma/client.js";
import type { SeriesReconcileUpdatedCountRow } from "./series.types.js";

export const seriesRepository = {
  findOne(where: Prisma.SeriesWhereUniqueInput, db: PrismaTx = prisma) {
    return db.series.findUnique({
      where
    });
  },

  findMany(where: Prisma.SeriesWhereInput, db: PrismaTx = prisma) {
    return db.series.findMany({
      where
    });
  },

  upsert(
    where: Prisma.SeriesWhereUniqueInput,
    data: Prisma.SeriesCreateInput,
    db: PrismaTx = prisma
  ) {
    return db.series.upsert({
      where,
      create: data,
      update: data
    });
  },

  async reconcileEpisodeCounts(tmdbIds: number[], releaseCutoff: Date, db: PrismaTx = prisma) {
    if (tmdbIds.length === 0) {
      return 0;
    }

    const [result] = await db.$queryRaw<SeriesReconcileUpdatedCountRow[]>(Prisma.sql`
      WITH episode_counts AS (
        SELECT
          s.id,
          COUNT(e.id)::int AS "numberOfEpisodes"
        FROM "Series" s
        LEFT JOIN "Episode" e
          ON e."seriesId" = s.id
          AND e."seasonNumber" <> 0
          AND e."airDate" IS NOT NULL
          AND e."airDate" < ${releaseCutoff}
        WHERE s."tmdbId" IN (${Prisma.join(tmdbIds)})
        GROUP BY s.id
      ),
      updated_series AS (
        UPDATE "Series" s
        SET
          "numberOfEpisodes" = episode_counts."numberOfEpisodes",
          "updatedAt" = CURRENT_TIMESTAMP
        FROM episode_counts
        WHERE s.id = episode_counts.id
          AND s."numberOfEpisodes" IS DISTINCT FROM episode_counts."numberOfEpisodes"
        RETURNING s.id
      )
      SELECT COUNT(*)::int AS "updatedCount"
      FROM updated_series
    `);

    return result?.updatedCount ?? 0;
  },

  async addGenres(seriesId: number, genreIds: number[], db: PrismaTx = prisma) {
    await db.seriesGenre.createMany({
      data: genreIds.map((genreId) => ({
        seriesId,
        genreId
      })),
      skipDuplicates: true
    });
  },

  async addNetworks(seriesId: number, networkIds: number[], db: PrismaTx = prisma) {
    await db.seriesNetwork.createMany({
      data: networkIds.map((networkId) => ({
        seriesId,
        networkId
      })),
      skipDuplicates: true
    });
  },

  async addPeople(seriesId: number, peopleIds: number[], db: PrismaTx = prisma) {
    await db.seriesPeople.createMany({
      data: peopleIds.map((peopleId) => ({ seriesId, peopleId })),
      skipDuplicates: true
    });
  },

  async replaceGenres(seriesId: number, genreIds: number[], db: PrismaTx = prisma) {
    await db.seriesGenre.deleteMany({ where: { seriesId } });
    return this.addGenres(seriesId, genreIds, db);
  },

  async replaceNetworks(seriesId: number, networkIds: number[], db: PrismaTx = prisma) {
    await db.seriesNetwork.deleteMany({ where: { seriesId } });
    return this.addNetworks(seriesId, networkIds, db);
  },

  async replacePeople(seriesId: number, peopleIds: number[], db: PrismaTx = prisma) {
    await db.seriesPeople.deleteMany({ where: { seriesId } });
    return this.addPeople(seriesId, peopleIds, db);
  }
};

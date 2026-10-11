import { Prisma } from "@/generated/prisma/client.js";
import type { SeriesUpdateInput } from "@/generated/prisma/models.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { notFound } from "@/shared/errors/errors.helpers.js";

export const seriesRepository = {
  async upsert(data: Prisma.SeriesUncheckedCreateInput, db: PrismaTx = prisma) {
    return db.series.upsert({
      where: { tmdbId: data.tmdbId },
      create: data,
      update: data
    });
  },

  async getById(id: number, db: PrismaTx = prisma) {
    return db.series.findUnique({ where: { id } });
  },

  async requireById(id: number, db: PrismaTx = prisma) {
    const series = await db.series.findUnique({ where: { id } });

    if (!series) {
      throw notFound("SERIES_NOT_FOUND", "Series not found");
    }

    return series;
  },

  async getByTmdbId(tmdbId: number, db: PrismaTx = prisma) {
    return db.series.findUnique({ where: { tmdbId } });
  },

  async listByTmdbIds(tmdbIds: number[], db: PrismaTx = prisma) {
    return db.series.findMany({ where: { tmdbId: { in: tmdbIds } } });
  },

  async update(id: number, data: SeriesUpdateInput, db: PrismaTx = prisma) {
    return db.series.update({ where: { id }, data });
  }
};

export const seriesGenreRepository = {
  async replaceBySeriesId(seriesId: number, genreIds: readonly number[], db: PrismaTx = prisma) {
    await db.seriesGenre.deleteMany({ where: { seriesId } });

    if (genreIds.length > 0) {
      await db.seriesGenre.createMany({
        data: genreIds.map((genreId) => ({ seriesId, genreId })),
        skipDuplicates: true
      });
    }
  }
};

export const seriesNetworkRepository = {
  async replaceBySeriesId(seriesId: number, networkIds: readonly number[], db: PrismaTx = prisma) {
    await db.seriesNetwork.deleteMany({ where: { seriesId } });

    if (networkIds.length > 0) {
      await db.seriesNetwork.createMany({
        data: networkIds.map((networkId) => ({ seriesId, networkId })),
        skipDuplicates: true
      });
    }
  }
};

export const seriesPeopleRepository = {
  async replaceBySeriesId(seriesId: number, peopleIds: readonly number[], db: PrismaTx = prisma) {
    await db.seriesPeople.deleteMany({ where: { seriesId } });

    if (peopleIds.length > 0) {
      await db.seriesPeople.createMany({
        data: peopleIds.map((peopleId) => ({ seriesId, peopleId })),
        skipDuplicates: true
      });
    }
  }
};

export const seriesProviderRepository = {
  async replaceBySeriesId(seriesId: number, providerIds: readonly number[], db: PrismaTx = prisma) {
    await db.seriesProvider.deleteMany({ where: { seriesId } });

    if (providerIds.length > 0) {
      await db.seriesProvider.createMany({
        data: providerIds.map((providerId) => ({ seriesId, providerId })),
        skipDuplicates: true
      });
    }
  }
};

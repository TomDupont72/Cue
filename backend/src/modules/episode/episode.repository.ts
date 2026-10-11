import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PrismaTx } from "@/shared/db/prisma.types.js";
import { notFound } from "@/shared/errors/errors.helpers.js";
import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";

export function upsertEpisodes(
  data: readonly Prisma.EpisodeUncheckedCreateInput[],
  db: PrismaTx = prisma
) {
  return upsertManyAndFetch({
    data,
    scalarFields: Prisma.EpisodeScalarFieldEnum,
    uniqueBy: "tmdbId",
    delegate: db.episode
  });
}

export async function replaceEpisodePeople(
  episodeIds: readonly number[],
  links: readonly Prisma.EpisodePeopleCreateManyInput[],
  db: PrismaTx = prisma
) {
  await db.episodePeople.deleteMany({ where: { episodeId: { in: [...episodeIds] } } });

  if (links.length > 0) {
    await db.episodePeople.createMany({ data: [...links], skipDuplicates: true });
  }
}

export async function replaceEpisodeCharacters(
  episodeIds: readonly number[],
  links: readonly Prisma.EpisodeCharacterCreateManyInput[],
  db: PrismaTx = prisma
) {
  await db.episodeCharacter.deleteMany({ where: { episodeId: { in: [...episodeIds] } } });

  if (links.length > 0) {
    await db.episodeCharacter.createMany({ data: [...links], skipDuplicates: true });
  }
}

export async function listEpisodeBySeriesId(seriesId: number, db: PrismaTx = prisma) {
  return db.episode.findMany({ where: { seriesId } });
}

export async function findEpisodeById(id: number, seriesId: number, db: PrismaTx = prisma) {
  return db.episode.findUnique({ where: { id, seriesId } });
}

export async function requireEpisodeById(id: number, seriesId: number, db: PrismaTx = prisma) {
  const episode = await findEpisodeById(id, seriesId, db);

  if (!episode) {
    throw notFound("EPISODE_NOT_FOUND", "Episode not found");
  }

  return episode;
}

export async function findReleasedEpisodeById(
  id: number,
  seriesId: number,
  date: Date,
  db: PrismaTx = prisma
) {
  return db.episode.findUnique({ where: { id, seriesId, airDate: { lt: date } } });
}

export async function requireReleasedEpisodeById(
  id: number,
  seriesId: number,
  date: Date,
  db: PrismaTx = prisma
) {
  const episode = await findReleasedEpisodeById(id, seriesId, date, db);

  if (!episode) {
    throw notFound("EPISODE_NOT_FOUND", "Episode not found");
  }

  return episode;
}

export async function listEpisodesBySeasonId(
  seasonId: number,
  seriesId: number,
  db: PrismaTx = prisma
) {
  return db.episode.findMany({ where: { seasonId, seriesId } });
}

export async function listNotEmptyEpisodesBySeasonId(
  seasonId: number,
  seriesId: number,
  db: PrismaTx = prisma
) {
  const episodes = await listEpisodesBySeasonId(seasonId, seriesId, db);

  if (episodes.length === 0) {
    throw notFound("EPISODE_NOT_FOUND", "Episode not found");
  }

  return episodes;
}

export async function listReleasedEpisodesBySeasonId(
  seasonId: number,
  seriesId: number,
  date: Date,
  db: PrismaTx = prisma
) {
  return db.episode.findMany({ where: { seasonId, seriesId, airDate: { lt: date } } });
}

export async function listNotEmptyReleasedEpisodesBySeasonId(
  seasonId: number,
  seriesId: number,
  date: Date,
  db: PrismaTx = prisma
) {
  const episodes = await listReleasedEpisodesBySeasonId(seasonId, seriesId, date, db);

  if (episodes.length === 0) {
    throw notFound("EPISODE_NOT_FOUND", "Episode not found");
  }

  return episodes;
}

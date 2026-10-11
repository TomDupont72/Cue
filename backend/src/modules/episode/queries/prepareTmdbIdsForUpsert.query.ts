import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import { PrismaTx } from "@/shared/db/prisma.types.js";

export async function prepareTmdbIdsForUpsert(
  data: readonly Prisma.EpisodeUncheckedCreateInput[],
  db: PrismaTx = prisma
) {
  if (data.length === 0) {
    return;
  }

  const targetPositions = new Set(
    data.map(({ seriesId, seasonNumber, episodeNumber }) =>
      JSON.stringify([seriesId, seasonNumber, episodeNumber])
    )
  );
  const seriesIds = [...new Set(data.map(({ seriesId }) => seriesId))];
  const tmdbIds = [...new Set(data.map(({ tmdbId }) => tmdbId))];
  const episodes = await db.episode.findMany({
    where: {
      seriesId: { in: seriesIds },
      OR: [
        { tmdbId: { in: tmdbIds } },
        {
          OR: data.map(({ seriesId, seasonNumber, episodeNumber }) => ({
            seriesId,
            seasonNumber,
            episodeNumber
          }))
        }
      ]
    },
    select: {
      id: true,
      seriesId: true,
      seasonNumber: true,
      episodeNumber: true
    }
  });
  const retainedEpisodes = episodes.filter(({ seriesId, seasonNumber, episodeNumber }) =>
    targetPositions.has(JSON.stringify([seriesId, seasonNumber, episodeNumber]))
  );
  const displacedEpisodeIds = episodes
    .filter(
      ({ seriesId, seasonNumber, episodeNumber }) =>
        !targetPositions.has(JSON.stringify([seriesId, seasonNumber, episodeNumber]))
    )
    .map(({ id }) => id);

  if (displacedEpisodeIds.length > 0) {
    await db.episode.deleteMany({ where: { id: { in: displacedEpisodeIds } } });
  }

  await Promise.all(
    retainedEpisodes.map(({ id }) => db.episode.update({ where: { id }, data: { tmdbId: -id } }))
  );
}

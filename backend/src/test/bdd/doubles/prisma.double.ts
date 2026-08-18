import type {
  Episode,
  Prisma,
  Season,
  Series,
  UserEpisode,
  UserSeries
} from "@/generated/prisma/client.js";
import { prisma } from "@/shared/db/prisma.js";
import type { PatchScope } from "../support/patch-scope.js";

export type DatabaseState = {
  series: Series[];
  seasons: Season[];
  episodes: Episode[];
  userSeries: UserSeries[];
  userEpisodes: UserEpisode[];
};

export function createEmptyDatabaseState(): DatabaseState {
  return {
    series: [],
    seasons: [],
    episodes: [],
    userSeries: [],
    userEpisodes: []
  };
}

function unsupported(operation: string, args: unknown): never {
  throw new Error(`Unsupported Prisma query ${operation}: ${JSON.stringify(args)}`);
}

export class PrismaDouble {
  private state = createEmptyDatabaseState();

  load(state: DatabaseState) {
    this.state = structuredClone(state);
  }

  install(scope: PatchScope) {
    scope.replace(prisma.series, "findUnique", async (args: Prisma.SeriesFindUniqueArgs) => {
      const id = args.where.id;

      if (typeof id !== "number") {
        unsupported("series.findUnique", args);
      }

      return this.state.series.find((series) => series.id === id) ?? null;
    });

    scope.replace(prisma.season, "findMany", async (args: Prisma.SeasonFindManyArgs) => {
      const seriesId = args.where?.seriesId;

      if (typeof seriesId !== "number") {
        unsupported("season.findMany", args);
      }

      return this.state.seasons.filter((season) => season.seriesId === seriesId);
    });

    scope.replace(prisma.episode, "findMany", async (args: Prisma.EpisodeFindManyArgs) => {
      const seriesId = args.where?.seriesId;

      if (typeof seriesId !== "number") {
        unsupported("episode.findMany", args);
      }

      return this.state.episodes.filter((episode) => episode.seriesId === seriesId);
    });

    scope.replace(
      prisma.userSeries,
      "findUnique",
      async (args: Prisma.UserSeriesFindUniqueArgs) => {
        const key = args.where.userId_seriesId;

        if (!key) {
          unsupported("userSeries.findUnique", args);
        }

        return (
          this.state.userSeries.find(
            (item) => item.userId === key.userId && item.seriesId === key.seriesId
          ) ?? null
        );
      }
    );

    scope.replace(prisma.userEpisode, "findMany", async (args: Prisma.UserEpisodeFindManyArgs) => {
      const where = args.where as
        | {
            userId?: unknown;
            episode?: {
              seriesId?: unknown;
            };
          }
        | undefined;

      const userId = where?.userId;
      const seriesId = where?.episode?.seriesId;

      if (typeof userId !== "string" || typeof seriesId !== "number") {
        unsupported("userEpisode.findMany", args);
      }

      const episodeIds = new Set(
        this.state.episodes
          .filter((episode) => episode.seriesId === seriesId)
          .map((episode) => episode.id)
      );

      return this.state.userEpisodes.filter(
        (item) => item.userId === userId && episodeIds.has(item.episodeId)
      );
    });
  }
}

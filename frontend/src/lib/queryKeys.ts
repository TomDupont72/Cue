import type { UserSeriesStatus } from "@/features/user/constants/userSeriesStatus";

export const queryKeys = {
  series: {
    all: ["series"] as const,

    search: (query: string, page: number) =>
      [...queryKeys.series.all, "search", query, page] as const,

    detail: (seriesId: number) => [...queryKeys.series.all, "detail", seriesId] as const
  },

  userSeries: {
    all: ["user-series"] as const,

    list: (seriesId?: number, status?: UserSeriesStatus) =>
      [...queryKeys.userSeries.all, "list", seriesId, status] as const,

    detail: (seriesId: number) => [...queryKeys.userSeries.all, seriesId] as const
  },

  userDashboard: {
    all: ["user-dashboard"] as const,

    summary: () => [...queryKeys.userDashboard.all, "summary"] as const
  },

  userEpisodes: {
    all: ["user-episodes"] as const,

    feed: () => [...queryKeys.userEpisodes.all, "feed"] as const
  }
};

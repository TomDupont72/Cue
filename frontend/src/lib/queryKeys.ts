export const queryKeys = {
  series: {
    all: ["series"] as const,

    search: (query: string, page: number) =>
      [...queryKeys.series.all, "search", query, page] as const,

    detail: (seriesId: number) => [...queryKeys.series.all, "detail", seriesId] as const
  },

  userSeries: {
    all: ["user-series"] as const,

    detail: (seriesId: number) => [...queryKeys.userSeries.all, seriesId] as const
  }
};

export const USER_SERIES_STATUS = {
  WATCHING: "WATCHING",
  PAUSED: "PAUSED",
  PLANNED: "PLANNED",
  COMPLETED: "COMPLETED",
  DROPPED: "DROPPED"
} as const;

export type UserSeriesStatus = (typeof USER_SERIES_STATUS)[keyof typeof USER_SERIES_STATUS];

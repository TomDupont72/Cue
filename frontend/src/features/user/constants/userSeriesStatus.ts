export const USER_SERIES_STATUS = {
  WATCHING: "WATCHING",
  PLANNED: "PLANNED",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  DROPPED: "DROPPED"
} as const;

export type UserSeriesStatus = (typeof USER_SERIES_STATUS)[keyof typeof USER_SERIES_STATUS];

export const USER_SERIES_STATUS_LABELS = {
  WATCHING: "EN COURS",
  PLANNED: "PAS COMMENCÉES",
  PAUSED: "EN PAUSE",
  COMPLETED: "TERMINÉES",
  DROPPED: "ARRÊTÉES"
} satisfies Record<UserSeriesStatus, string>;

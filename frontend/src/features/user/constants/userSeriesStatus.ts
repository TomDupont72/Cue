export const USER_SERIES_STATUS = {
  WATCHING: "WATCHING",
  PAUSED: "PAUSED",
  PLANNED: "PLANNED",
  COMPLETED: "COMPLETED",
  DROPPED: "DROPPED"
} as const;

export const USER_SERIES_STATUS_COLOR = {
  WATCHING: "bg-blue-50 text-blue-700 dark:bg-blue-950 border-blue-200 dark:text-blue-300",
  PAUSED: "bg-purple-50 text-purple-700 dark:bg-purple-950 border-purple-200 dark:text-purple-300",
  PLANNED: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 border-yellow-200 dark:text-yellow-300",
  COMPLETED: "bg-green-50 text-green-700 dark:bg-green-950 border-green-200 dark:text-green-300",
  DROPPED: "bg-red-50 text-red-700 dark:bg-red-950 border-red-200 dark:text-red-300"
} as const;

export const USER_SERIES_STATUS_CHART_COLOR = {
  WATCHING: "var(--color-blue-500)",
  PAUSED: "var(--color-purple-500)",
  PLANNED: "var(--color-yellow-500)",
  COMPLETED: "var(--color-green-500)",
  DROPPED: "var(--color-red-500)"
} as const;

export type UserSeriesStatus = (typeof USER_SERIES_STATUS)[keyof typeof USER_SERIES_STATUS];

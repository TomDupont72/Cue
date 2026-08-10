import type { UserSeriesStatus as ApiUserSeriesStatus } from "@/api/generated/cue-api";

export type UserSeriesStatus = ApiUserSeriesStatus;

export const USER_SERIES_STATUS = {
  WATCHING: "WATCHING",
  PLANNED: "PLANNED",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  DROPPED: "DROPPED"
} as const satisfies Record<UserSeriesStatus, UserSeriesStatus>;

export const STATUS_TEXT_MAPPING = {
  WATCHING: "EN COURS",
  PLANNED: "PAS COMMENCÉES",
  PAUSED: "EN PAUSE",
  COMPLETED: "TERMINÉES",
  DROPPED: "ARRÊTÉES"
} satisfies Record<UserSeriesStatus, string>;

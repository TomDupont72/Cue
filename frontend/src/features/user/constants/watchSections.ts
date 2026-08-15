import { USER_SERIES_STATUS } from "@/features/user/constants/userSeriesStatus";

export const WATCH_SECTIONS = [
  USER_SERIES_STATUS.WATCHING,
  USER_SERIES_STATUS.PAUSED,
  USER_SERIES_STATUS.DROPPED
] as const;

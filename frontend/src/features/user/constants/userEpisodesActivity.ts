const DAY_IN_MILLISECONDS = 86_400_000;

export const USER_EPISODES_ACTIVITY_PERIODS = {
  month: 30 * DAY_IN_MILLISECONDS,
  months3: 91 * DAY_IN_MILLISECONDS,
  months6: 182 * DAY_IN_MILLISECONDS,
  year: 365 * DAY_IN_MILLISECONDS,
  years2: 2 * 365 * DAY_IN_MILLISECONDS,
  years5: 5 * 365 * DAY_IN_MILLISECONDS
} as const;

export type UserEpisodesActivityPeriod = keyof typeof USER_EPISODES_ACTIVITY_PERIODS | "all";

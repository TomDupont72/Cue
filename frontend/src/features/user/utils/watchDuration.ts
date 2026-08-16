export function splitWatchedDuration(totalMinutes: number) {
  return [
    Math.floor(totalMinutes / 43_200),
    Math.floor((totalMinutes % 43_200) / 1_440),
    Math.floor((totalMinutes % 1_440) / 60),
    totalMinutes % 60
  ] as const;
}

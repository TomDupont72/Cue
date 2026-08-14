const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const AIR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/;

function getUtcDayTimestamp(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getAirDateUtcDayTimestamp(airDate: string) {
  const match = AIR_DATE_PATTERN.exec(airDate);

  if (!match || (airDate.length > 10 && Number.isNaN(Date.parse(airDate)))) {
    return null;
  }

  const [, year, month, day] = match;
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const parsedDate = new Date(timestamp);

  if (
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() !== Number(month) - 1 ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return timestamp;
}

export function getEpisodeReleaseDayDifference(
  airDate: string | null,
  now: Date = new Date()
): number | null {
  if (airDate === null) {
    return null;
  }

  const airDateTimestamp = getAirDateUtcDayTimestamp(airDate);

  if (airDateTimestamp === null) {
    return null;
  }

  return (airDateTimestamp - getUtcDayTimestamp(now)) / MILLISECONDS_PER_DAY;
}

export function isEpisodeReleased(airDate: string | null, now: Date = new Date()) {
  const remainingDays = getEpisodeReleaseDayDifference(airDate, now);

  return remainingDays !== null && remainingDays <= 0;
}

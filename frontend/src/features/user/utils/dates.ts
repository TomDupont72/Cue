export function splitWatchedDuration(totalMinutes: number) {
  return [
    Math.floor(totalMinutes / 43_200),
    Math.floor((totalMinutes % 43_200) / 1_440),
    Math.floor((totalMinutes % 1_440) / 60),
    totalMinutes % 60
  ] as const;
}

export function durationToString(totalMinutes: number) {
  const [months, days, hours, minutes] = splitWatchedDuration(totalMinutes);
  const durationParts: string[] = [];

  if (months > 0) {
    durationParts.push(`${months} m`);
  }

  if (months > 0 || days > 0) {
    durationParts.push(`${days} j`);
  }

  if (months > 0 || days > 0 || hours > 0) {
    durationParts.push(`${hours} h`);
  }

  durationParts.push(`${minutes} min`);

  return durationParts.join(" ");
}

export type DateDisplayFormat = "daily" | "monthly" | "yearly";

export function displayDate(
  date: string | number | Date,
  locale: string,
  format: DateDisplayFormat = "yearly"
) {
  const currentDate = new Date(date);

  return currentDate.toLocaleDateString(locale, {
    year: "numeric",
    ...(["daily", "monthly"].includes(format) && { month: "short" }),
    ...(format === "daily" && { day: "numeric" })
  });
}

export function getTimeAxis(timestamps: readonly number[]) {
  const start = timestamps[0];
  const end = timestamps.at(-1);

  if (start === undefined || end === undefined || start === end) {
    return { format: "daily" as const, ticks: timestamps };
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  const rangeInDays = (end - start) / 86_400_000;
  const rangeInMonths =
    (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
    endDate.getUTCMonth() -
    startDate.getUTCMonth();
  const rangeInYears = endDate.getUTCFullYear() - startDate.getUTCFullYear();
  const initialFormat: DateDisplayFormat =
    rangeInDays <= 45 ? "daily" : rangeInMonths <= 18 ? "monthly" : "yearly";
  const formatCandidates: DateDisplayFormat[] =
    initialFormat === "yearly"
      ? ["yearly", "monthly", "daily"]
      : initialFormat === "monthly"
        ? ["monthly", "daily"]
        : ["daily"];

  for (const format of formatCandidates) {
    const step =
      format === "daily"
        ? Math.ceil(rangeInDays / 6)
        : format === "monthly"
          ? Math.ceil(rangeInMonths / 6)
          : Math.ceil(rangeInYears / 6);
    const cursor = new Date(start);

    if (format === "daily") {
      cursor.setUTCHours(0, 0, 0, 0);
      cursor.setUTCDate(cursor.getUTCDate() + step);
    } else if (format === "monthly") {
      cursor.setUTCDate(1);
      cursor.setUTCHours(0, 0, 0, 0);
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    } else {
      cursor.setUTCMonth(0, 1);
      cursor.setUTCHours(0, 0, 0, 0);
      cursor.setUTCFullYear(cursor.getUTCFullYear() + 1);
    }

    const ticks: number[] = [];

    while (cursor.getTime() <= end) {
      ticks.push(cursor.getTime());

      if (format === "daily") {
        cursor.setUTCDate(cursor.getUTCDate() + step);
      } else if (format === "monthly") {
        cursor.setUTCMonth(cursor.getUTCMonth() + step);
      } else {
        cursor.setUTCFullYear(cursor.getUTCFullYear() + step);
      }
    }

    if (ticks.length >= 2) {
      return { format, ticks };
    }
  }

  return { format: "daily" as const, ticks: [start, end] };
}

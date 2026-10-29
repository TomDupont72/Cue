export function splitWatchedDuration(totalMinutes: number) {
  return [
    Math.floor(totalMinutes / 43_200),
    Math.floor((totalMinutes % 43_200) / 1_440),
    Math.floor((totalMinutes % 1_440) / 60),
    totalMinutes % 60
  ] as const;
}

export function displayDate(date: string, locale: string, format: "daily" | "monthly" | "yearly" = "yearly") {
    const currentDate = new Date(date)

    return currentDate.toLocaleDateString(locale, {year: "numeric", ...(["daily", "monthly"].includes(format) && {month: "short"}), ...(format === "daily" && {day: "numeric"})})
}
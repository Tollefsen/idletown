import type { CalendarConfig, LeapYearRule } from "./types";

export function isLeapYear(year: number, leapYearRule?: LeapYearRule): boolean {
  if (!leapYearRule || leapYearRule.type === "none") {
    return false;
  }
  if (leapYearRule.type === "gregorian") {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }
  if (leapYearRule.type === "custom" && leapYearRule.customRule) {
    return leapYearRule.customRule(year);
  }
  return false;
}

export function getMonthDays(
  calendar: CalendarConfig,
  monthIndex: number,
  year: number,
): number {
  const month = calendar.months[monthIndex];
  if (month.leapYearDays && isLeapYear(year, calendar.leapYearRule)) {
    return month.leapYearDays;
  }
  return month.days;
}

export function getDateKey(
  year: number,
  era: string,
  monthIndex: number,
  day: number,
): string {
  return `${era}:${year}:${monthIndex}:${day}`;
}

export function getDateLabel(
  dateKey: string,
  calendar: CalendarConfig,
): string {
  const parts = dateKey.split(":");
  if (parts.length === 4) {
    const [era, year, monthIndex, day] = parts;
    const month = calendar.months[Number(monthIndex)];
    const eraLabel = calendar.useEras
      ? era === "after"
        ? calendar.eraNames?.after || "AD"
        : calendar.eraNames?.before || "BC"
      : "";
    return `${month?.name || "Unknown"} ${day}, ${year} ${eraLabel}`.trim();
  }
  const [monthIndex, day] = dateKey.split("-").map(Number);
  const month = calendar.months[monthIndex];
  return `${month?.name || "Unknown"} ${day}`;
}

export function sortEntries<T extends { date: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const aParts = a.date.split(":");
    const bParts = b.date.split(":");

    if (aParts.length === 4 && bParts.length === 4) {
      const [aEra, aYear, aMonth, aDay] = aParts.map((v, i) =>
        i === 0 ? v : Number(v),
      );
      const [bEra, bYear, bMonth, bDay] = bParts.map((v, i) =>
        i === 0 ? v : Number(v),
      );

      if (aEra !== bEra) return aEra === "before" ? -1 : 1;
      if (aEra === "before") {
        if (aYear !== bYear) return (bYear as number) - (aYear as number);
      } else {
        if (aYear !== bYear) return (aYear as number) - (bYear as number);
      }
      if (aMonth !== bMonth) return (aMonth as number) - (bMonth as number);
      return (aDay as number) - (bDay as number);
    }

    const [aMonth, aDay] = a.date.split("-").map(Number);
    const [bMonth, bDay] = b.date.split("-").map(Number);
    if (aMonth !== bMonth) return aMonth - bMonth;
    return aDay - bDay;
  });
}

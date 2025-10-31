import { describe, it, expect } from "vitest";
import {
  isLeapYear,
  getMonthDays,
  getDateKey,
  getDateLabel,
  sortEntries,
} from "./utils";
import type { CalendarConfig, LeapYearRule } from "./types";

describe("isLeapYear", () => {
  it("should return false when no leap year rule is provided", () => {
    const result = isLeapYear(2024);

    expect(result).toBe(false);
  });

  it("should return false when leap year rule type is none", () => {
    const rule: LeapYearRule = { type: "none" };

    const result = isLeapYear(2024, rule);

    expect(result).toBe(false);
  });

  it("should correctly identify gregorian leap years", () => {
    const rule: LeapYearRule = { type: "gregorian" };

    expect(isLeapYear(2024, rule)).toBe(true);
    expect(isLeapYear(2000, rule)).toBe(true);
    expect(isLeapYear(2023, rule)).toBe(false);
    expect(isLeapYear(1900, rule)).toBe(false);
  });

  it("should use custom rule when provided", () => {
    const rule: LeapYearRule = {
      type: "custom",
      customRule: (year) => year % 5 === 0,
    };

    expect(isLeapYear(2025, rule)).toBe(true);
    expect(isLeapYear(2024, rule)).toBe(false);
  });
});

describe("getMonthDays", () => {
  it("should return regular month days when not a leap year", () => {
    const calendar: CalendarConfig = {
      id: "test",
      name: "Test Calendar",
      months: [
        { name: "January", days: 31 },
        { name: "February", days: 28, leapYearDays: 29 },
      ],
      leapYearRule: { type: "gregorian" },
    };

    const result = getMonthDays(calendar, 1, 2023);

    expect(result).toBe(28);
  });

  it("should return leap year days when it is a leap year", () => {
    const calendar: CalendarConfig = {
      id: "test",
      name: "Test Calendar",
      months: [
        { name: "January", days: 31 },
        { name: "February", days: 28, leapYearDays: 29 },
      ],
      leapYearRule: { type: "gregorian" },
    };

    const result = getMonthDays(calendar, 1, 2024);

    expect(result).toBe(29);
  });

  it("should return regular days when month has no leap year days", () => {
    const calendar: CalendarConfig = {
      id: "test",
      name: "Test Calendar",
      months: [{ name: "January", days: 31 }],
      leapYearRule: { type: "gregorian" },
    };

    const result = getMonthDays(calendar, 0, 2024);

    expect(result).toBe(31);
  });
});

describe("getDateKey", () => {
  it("should create a date key with era, year, month, and day", () => {
    const result = getDateKey(2024, "after", 5, 15);

    expect(result).toBe("after:2024:5:15");
  });

  it("should work with before era", () => {
    const result = getDateKey(100, "before", 2, 1);

    expect(result).toBe("before:100:2:1");
  });
});

describe("getDateLabel", () => {
  it("should format date label with era for full date key", () => {
    const calendar: CalendarConfig = {
      id: "test",
      name: "Test Calendar",
      months: [
        { name: "January", days: 31 },
        { name: "February", days: 28 },
      ],
      useEras: true,
      eraNames: { before: "BC", after: "AD" },
    };

    const result = getDateLabel("after:2024:1:15", calendar);

    expect(result).toBe("February 15, 2024 AD");
  });

  it("should format date label without era when useEras is false", () => {
    const calendar: CalendarConfig = {
      id: "test",
      name: "Test Calendar",
      months: [
        { name: "January", days: 31 },
        { name: "February", days: 28 },
      ],
      useEras: false,
    };

    const result = getDateLabel("after:2024:1:15", calendar);

    expect(result).toBe("February 15, 2024");
  });

  it("should format simple date key without era", () => {
    const calendar: CalendarConfig = {
      id: "test",
      name: "Test Calendar",
      months: [
        { name: "January", days: 31 },
        { name: "February", days: 28 },
      ],
    };

    const result = getDateLabel("1-15", calendar);

    expect(result).toBe("February 15");
  });
});

describe("sortEntries", () => {
  it("should sort entries with full date keys chronologically", () => {
    const entries = [
      { date: "after:2024:5:15", content: "Entry 3" },
      { date: "after:2023:1:1", content: "Entry 1" },
      { date: "after:2024:1:10", content: "Entry 2" },
    ];

    const result = sortEntries(entries);

    expect(result[0].content).toBe("Entry 1");
    expect(result[1].content).toBe("Entry 2");
    expect(result[2].content).toBe("Entry 3");
  });

  it("should sort before era before after era", () => {
    const entries = [
      { date: "after:100:1:1", content: "After" },
      { date: "before:100:1:1", content: "Before" },
    ];

    const result = sortEntries(entries);

    expect(result[0].content).toBe("Before");
    expect(result[1].content).toBe("After");
  });

  it("should sort before era years in reverse order", () => {
    const entries = [
      { date: "before:100:1:1", content: "BC 100" },
      { date: "before:200:1:1", content: "BC 200" },
      { date: "before:50:1:1", content: "BC 50" },
    ];

    const result = sortEntries(entries);

    expect(result[0].content).toBe("BC 200");
    expect(result[1].content).toBe("BC 100");
    expect(result[2].content).toBe("BC 50");
  });

  it("should sort simple date keys by month and day", () => {
    const entries = [
      { date: "5-15", content: "May 15" },
      { date: "1-1", content: "Jan 1" },
      { date: "1-10", content: "Jan 10" },
    ];

    const result = sortEntries(entries);

    expect(result[0].content).toBe("Jan 1");
    expect(result[1].content).toBe("Jan 10");
    expect(result[2].content).toBe("May 15");
  });
});

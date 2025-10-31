import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "../config/constants";
import type { StorageAdapter } from "./storage";
import { storage } from "./storage";
import type { CalendarConfig, DiaryEntry } from "./types";

describe("LocalStorageAdapter", () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    adapter = storage;
    (adapter as unknown as { initialized: boolean }).initialized = false;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getCalendars", () => {
    it("should return empty array when no calendars exist", () => {
      const result = adapter.getCalendars();

      expect(result).toEqual([]);
    });

    it("should return stored calendars", () => {
      const calendars: CalendarConfig[] = [
        {
          id: "cal1",
          name: "Test Calendar",
          months: [{ name: "January", days: 31 }],
        },
      ];
      localStorage.setItem(
        STORAGE_KEYS.calendarDiaryCalendars,
        JSON.stringify(calendars),
      );

      const result = adapter.getCalendars();

      expect(result).toEqual(calendars);
    });

    it("should return empty array when data is corrupted", () => {
      localStorage.setItem(
        STORAGE_KEYS.calendarDiaryCalendars,
        "invalid-json{",
      );

      const result = adapter.getCalendars();

      expect(result).toEqual([]);
    });
  });

  describe("saveCalendar", () => {
    it("should save new calendar", () => {
      const calendar: CalendarConfig = {
        id: "cal1",
        name: "Test Calendar",
        months: [{ name: "January", days: 31 }],
      };

      adapter.saveCalendar(calendar);

      const stored = localStorage.getItem(STORAGE_KEYS.calendarDiaryCalendars);
      expect(JSON.parse(stored || "[]")).toEqual([calendar]);
    });

    it("should update existing calendar", () => {
      const original: CalendarConfig = {
        id: "cal1",
        name: "Original",
        months: [{ name: "January", days: 31 }],
      };
      const updated: CalendarConfig = {
        id: "cal1",
        name: "Updated",
        months: [{ name: "February", days: 28 }],
      };

      adapter.saveCalendar(original);
      adapter.saveCalendar(updated);

      const result = adapter.getCalendars();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Updated");
    });

    it("should add calendar without replacing others", () => {
      const calendar1: CalendarConfig = {
        id: "cal1",
        name: "Calendar 1",
        months: [{ name: "January", days: 31 }],
      };
      const calendar2: CalendarConfig = {
        id: "cal2",
        name: "Calendar 2",
        months: [{ name: "February", days: 28 }],
      };

      adapter.saveCalendar(calendar1);
      adapter.saveCalendar(calendar2);

      const result = adapter.getCalendars();
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(["cal1", "cal2"]);
    });
  });

  describe("deleteCalendar", () => {
    it("should delete calendar by id", () => {
      const calendar: CalendarConfig = {
        id: "cal1",
        name: "Test Calendar",
        months: [{ name: "January", days: 31 }],
      };

      adapter.saveCalendar(calendar);
      adapter.deleteCalendar("cal1");

      const result = adapter.getCalendars();
      expect(result).toEqual([]);
    });

    it("should delete associated entries when deleting calendar", () => {
      const calendar: CalendarConfig = {
        id: "cal1",
        name: "Test Calendar",
        months: [{ name: "January", days: 31 }],
      };
      const entry: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:1",
        content: "Test entry",
        updatedAt: Date.now(),
      };

      adapter.saveCalendar(calendar);
      adapter.saveEntry(entry);
      adapter.deleteCalendar("cal1");

      const entries = adapter.getEntries("cal1");
      expect(entries).toEqual([]);
    });

    it("should not affect other calendars when deleting", () => {
      const calendar1: CalendarConfig = {
        id: "cal1",
        name: "Calendar 1",
        months: [{ name: "January", days: 31 }],
      };
      const calendar2: CalendarConfig = {
        id: "cal2",
        name: "Calendar 2",
        months: [{ name: "February", days: 28 }],
      };

      adapter.saveCalendar(calendar1);
      adapter.saveCalendar(calendar2);
      adapter.deleteCalendar("cal1");

      const result = adapter.getCalendars();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("cal2");
    });

    it("should not affect entries from other calendars", () => {
      const entry1: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:1",
        content: "Entry 1",
        updatedAt: Date.now(),
      };
      const entry2: DiaryEntry = {
        calendarId: "cal2",
        date: "after:2024:0:1",
        content: "Entry 2",
        updatedAt: Date.now(),
      };

      adapter.saveEntry(entry1);
      adapter.saveEntry(entry2);
      adapter.deleteCalendar("cal1");

      const entries = adapter.getEntries("cal2");
      expect(entries).toHaveLength(1);
      expect(entries[0].content).toBe("Entry 2");
    });
  });

  describe("getEntries", () => {
    it("should return empty array when no entries exist", () => {
      const result = adapter.getEntries("cal1");

      expect(result).toEqual([]);
    });

    it("should return entries for specific calendar", () => {
      const entry1: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:1",
        content: "Entry 1",
        updatedAt: Date.now(),
      };
      const entry2: DiaryEntry = {
        calendarId: "cal2",
        date: "after:2024:0:2",
        content: "Entry 2",
        updatedAt: Date.now(),
      };

      adapter.saveEntry(entry1);
      adapter.saveEntry(entry2);

      const result = adapter.getEntries("cal1");
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("Entry 1");
    });

    it("should return empty array when data is corrupted", () => {
      localStorage.setItem(STORAGE_KEYS.calendarDiaryEntries, "invalid-json{");

      const result = adapter.getEntries("cal1");

      expect(result).toEqual([]);
    });
  });

  describe("saveEntry", () => {
    it("should save new entry", () => {
      const entry: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:1",
        content: "Test entry",
        updatedAt: Date.now(),
      };

      adapter.saveEntry(entry);

      const result = adapter.getEntries("cal1");
      expect(result).toEqual([entry]);
    });

    it("should update existing entry", () => {
      const original: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:1",
        content: "Original",
        updatedAt: Date.now(),
      };
      const updated: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:1",
        content: "Updated",
        updatedAt: Date.now(),
      };

      adapter.saveEntry(original);
      adapter.saveEntry(updated);

      const result = adapter.getEntries("cal1");
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("Updated");
    });

    it("should add entry without replacing others", () => {
      const entry1: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:1",
        content: "Entry 1",
        updatedAt: Date.now(),
      };
      const entry2: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:2",
        content: "Entry 2",
        updatedAt: Date.now(),
      };

      adapter.saveEntry(entry1);
      adapter.saveEntry(entry2);

      const result = adapter.getEntries("cal1");
      expect(result).toHaveLength(2);
    });
  });

  describe("deleteEntry", () => {
    it("should delete entry by calendar id and date", () => {
      const entry: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:1",
        content: "Test entry",
        updatedAt: Date.now(),
      };

      adapter.saveEntry(entry);
      adapter.deleteEntry("cal1", "after:2024:0:1");

      const result = adapter.getEntries("cal1");
      expect(result).toEqual([]);
    });

    it("should not affect other entries when deleting", () => {
      const entry1: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:1",
        content: "Entry 1",
        updatedAt: Date.now(),
      };
      const entry2: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:2",
        content: "Entry 2",
        updatedAt: Date.now(),
      };

      adapter.saveEntry(entry1);
      adapter.saveEntry(entry2);
      adapter.deleteEntry("cal1", "after:2024:0:1");

      const result = adapter.getEntries("cal1");
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("Entry 2");
    });

    it("should only delete entry matching both calendar id and date", () => {
      const entry1: DiaryEntry = {
        calendarId: "cal1",
        date: "after:2024:0:1",
        content: "Entry 1",
        updatedAt: Date.now(),
      };
      const entry2: DiaryEntry = {
        calendarId: "cal2",
        date: "after:2024:0:1",
        content: "Entry 2",
        updatedAt: Date.now(),
      };

      adapter.saveEntry(entry1);
      adapter.saveEntry(entry2);
      adapter.deleteEntry("cal1", "after:2024:0:1");

      const result1 = adapter.getEntries("cal1");
      const result2 = adapter.getEntries("cal2");
      expect(result1).toHaveLength(0);
      expect(result2).toHaveLength(1);
    });
  });

  describe("version control integration", () => {
    it("should initialize version control on first operation", () => {
      adapter.getCalendars();

      const version = localStorage.getItem(
        `${STORAGE_KEYS.calendarDiaryCalendars}-version`,
      );
      expect(version).toBe("1");
    });

    it("should only initialize once", () => {
      adapter.getCalendars();
      adapter.getCalendars();

      const version = localStorage.getItem(
        `${STORAGE_KEYS.calendarDiaryCalendars}-version`,
      );
      expect(version).toBe("1");
    });
  });
});

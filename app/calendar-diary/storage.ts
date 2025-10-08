import type { CalendarConfig, DiaryEntry } from "./types";
import { VersionControl } from "./versionControl";

const CURRENT_VERSION = 1;
const SUPPORTED_VERSIONS = [1];

export interface StorageAdapter {
  getCalendars(): CalendarConfig[];
  saveCalendar(calendar: CalendarConfig): void;
  deleteCalendar(id: string): void;
  getEntries(calendarId: string): DiaryEntry[];
  saveEntry(entry: DiaryEntry): void;
  deleteEntry(calendarId: string, date: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  private CALENDARS_KEY = "calendar-diary-calendars";
  private ENTRIES_KEY = "calendar-diary-entries";

  private calendarVersionControl: VersionControl<CalendarConfig[]> | null = null;
  private entryVersionControl: VersionControl<DiaryEntry[]> | null = null;
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    this.calendarVersionControl = new VersionControl({
      storageKey: this.CALENDARS_KEY,
      currentVersion: CURRENT_VERSION,
      supportedVersions: SUPPORTED_VERSIONS,
      migrations: {},
    });

    this.entryVersionControl = new VersionControl({
      storageKey: this.ENTRIES_KEY,
      currentVersion: CURRENT_VERSION,
      supportedVersions: SUPPORTED_VERSIONS,
      migrations: {},
    });

    this.calendarVersionControl.initialize(() => {
      localStorage.removeItem(this.CALENDARS_KEY);
    });

    this.entryVersionControl.initialize(() => {
      localStorage.removeItem(this.ENTRIES_KEY);
    });

    this.initialized = true;
  }

  private getCalendarsRaw(): CalendarConfig[] {
    try {
      const data = localStorage.getItem(this.CALENDARS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getAllEntriesRaw(): DiaryEntry[] {
    try {
      const data = localStorage.getItem(this.ENTRIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getCalendars(): CalendarConfig[] {
    this.ensureInitialized();
    return this.getCalendarsRaw();
  }

  saveCalendar(calendar: CalendarConfig): void {
    this.ensureInitialized();
    const calendars = this.getCalendars();
    const index = calendars.findIndex((c) => c.id === calendar.id);
    if (index >= 0) {
      calendars[index] = calendar;
    } else {
      calendars.push(calendar);
    }
    localStorage.setItem(this.CALENDARS_KEY, JSON.stringify(calendars));
  }

  deleteCalendar(id: string): void {
    this.ensureInitialized();
    const calendars = this.getCalendars().filter((c) => c.id !== id);
    localStorage.setItem(this.CALENDARS_KEY, JSON.stringify(calendars));

    const entries = this.getAllEntriesRaw().filter((e) => e.calendarId !== id);
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(entries));
  }

  getEntries(calendarId: string): DiaryEntry[] {
    this.ensureInitialized();
    return this.getAllEntriesRaw().filter((e) => e.calendarId === calendarId);
  }

  saveEntry(entry: DiaryEntry): void {
    this.ensureInitialized();
    const entries = this.getAllEntriesRaw();
    const index = entries.findIndex(
      (e) => e.calendarId === entry.calendarId && e.date === entry.date,
    );
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(entries));
  }

  deleteEntry(calendarId: string, date: string): void {
    this.ensureInitialized();
    const entries = this.getAllEntriesRaw().filter(
      (e) => !(e.calendarId === calendarId && e.date === date),
    );
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(entries));
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();

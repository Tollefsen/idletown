import type { CalendarConfig, DiaryEntry } from "./types";

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

  getCalendars(): CalendarConfig[] {
    try {
      const data = localStorage.getItem(this.CALENDARS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCalendar(calendar: CalendarConfig): void {
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
    const calendars = this.getCalendars().filter((c) => c.id !== id);
    localStorage.setItem(this.CALENDARS_KEY, JSON.stringify(calendars));

    const entries = this.getAllEntries().filter((e) => e.calendarId !== id);
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(entries));
  }

  getEntries(calendarId: string): DiaryEntry[] {
    return this.getAllEntries().filter((e) => e.calendarId === calendarId);
  }

  saveEntry(entry: DiaryEntry): void {
    const entries = this.getAllEntries();
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
    const entries = this.getAllEntries().filter(
      (e) => !(e.calendarId === calendarId && e.date === date),
    );
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(entries));
  }

  private getAllEntries(): DiaryEntry[] {
    try {
      const data = localStorage.getItem(this.ENTRIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();

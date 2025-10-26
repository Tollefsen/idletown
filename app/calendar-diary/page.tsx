"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { storage } from "./storage";
import type { CalendarConfig, DiaryEntry } from "./types";

export default function CalendarDiaryPage() {
  const [calendars, setCalendars] = useState<CalendarConfig[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(
    null,
  );
  const [showCreateCalendar, setShowCreateCalendar] = useState(false);
  const [editingCalendarId, setEditingCalendarId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadedCalendars = storage.getCalendars();
    setCalendars(loadedCalendars);
    if (loadedCalendars.length > 0 && !selectedCalendarId) {
      setSelectedCalendarId(loadedCalendars[0].id);
    }
  }, [selectedCalendarId]);

  const selectedCalendar = calendars.find((c) => c.id === selectedCalendarId);

  const handleRenameCalendar = (id: string, newName: string) => {
    const calendar = calendars.find((c) => c.id === id);
    if (!calendar || !newName.trim()) return;

    const updated = { ...calendar, name: newName.trim() };
    storage.saveCalendar(updated);
    setCalendars(calendars.map((c) => (c.id === id ? updated : c)));
    setEditingCalendarId(null);
  };

  const handleDeleteCalendar = (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this calendar? All diary entries will be lost.",
      )
    ) {
      return;
    }

    storage.deleteCalendar(id);
    const updatedCalendars = calendars.filter((c) => c.id !== id);
    setCalendars(updatedCalendars);

    if (selectedCalendarId === id) {
      setSelectedCalendarId(
        updatedCalendars.length > 0 ? updatedCalendars[0].id : null,
      );
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline mb-2 inline-block"
          >
            ← Back to Idle Town
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">Calendar Diary</h1>
            <button
              type="button"
              onClick={() => setShowCreateCalendar(true)}
              className="px-4 py-2 bg-foreground text-background rounded hover:opacity-80 text-sm sm:text-base w-full sm:w-auto"
            >
              Create Calendar
            </button>
          </div>
        </header>

        {calendars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No calendars yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            <aside className="w-full lg:w-64">
              <h2 className="text-sm font-semibold mb-2">Your Calendars</h2>
              <ul className="space-y-1">
                {calendars.map((calendar) => (
                  <li key={calendar.id}>
                    {editingCalendarId === calendar.id ? (
                      <input
                        type="text"
                        defaultValue={calendar.name}
                        onBlur={(e) =>
                          handleRenameCalendar(calendar.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameCalendar(
                              calendar.id,
                              e.currentTarget.value,
                            );
                          } else if (e.key === "Escape") {
                            setEditingCalendarId(null);
                          }
                        }}
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    ) : (
                      <div
                        className={`flex items-center justify-between px-3 py-2 rounded ${
                          calendar.id === selectedCalendarId
                            ? "bg-foreground text-background"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedCalendarId(calendar.id)}
                          className="flex-1 text-left"
                        >
                          {calendar.name}
                        </button>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingCalendarId(calendar.id)}
                            className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            title="Rename calendar"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCalendar(calendar.id)}
                            className="px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900"
                            title="Delete calendar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </aside>

            <main className="flex-1">
              {selectedCalendar ? (
                <CalendarView calendar={selectedCalendar} />
              ) : null}
            </main>
          </div>
        )}

        {showCreateCalendar && (
          <CreateCalendarModal
            onClose={() => setShowCreateCalendar(false)}
            onSave={(calendar) => {
              storage.saveCalendar(calendar);
              setCalendars([...calendars, calendar]);
              setSelectedCalendarId(calendar.id);
              setShowCreateCalendar(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function CalendarView({ calendar }: { calendar: CalendarConfig }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "summary">("calendar");
  const [currentYear, setCurrentYear] = useState<number>(1);
  const [currentEra, setCurrentEra] = useState<"before" | "after">("after");

  useEffect(() => {
    setEntries(storage.getEntries(calendar.id));
  }, [calendar.id]);

  const isLeapYear = (year: number): boolean => {
    if (!calendar.leapYearRule || calendar.leapYearRule.type === "none") {
      return false;
    }
    if (calendar.leapYearRule.type === "gregorian") {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
    if (
      calendar.leapYearRule.type === "custom" &&
      calendar.leapYearRule.customRule
    ) {
      return calendar.leapYearRule.customRule(year);
    }
    return false;
  };

  const getMonthDays = (monthIndex: number): number => {
    const month = calendar.months[monthIndex];
    if (month.leapYearDays && isLeapYear(currentYear)) {
      return month.leapYearDays;
    }
    return month.days;
  };

  const getDateKey = (
    year: number,
    era: string,
    monthIndex: number,
    day: number,
  ): string => {
    return `${era}:${year}:${monthIndex}:${day}`;
  };

  const getEntry = (
    monthIndex: number,
    day: number,
  ): DiaryEntry | undefined => {
    const dateKey = getDateKey(currentYear, currentEra, monthIndex, day);
    return entries.find((e) => e.date === dateKey);
  };

  const handleDateClick = (monthIndex: number, day: number) => {
    setSelectedDate(getDateKey(currentYear, currentEra, monthIndex, day));
  };

  const handleSaveEntry = (content: string) => {
    if (!selectedDate) return;

    const entry: DiaryEntry = {
      calendarId: calendar.id,
      date: selectedDate,
      content,
      updatedAt: Date.now(),
    };

    storage.saveEntry(entry);
    setEntries([...entries.filter((e) => e.date !== selectedDate), entry]);
  };

  const selectedEntry = selectedDate
    ? entries.find((e) => e.date === selectedDate)
    : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold">{calendar.name}</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`flex-1 sm:flex-none px-3 py-1 rounded text-sm ${
              viewMode === "calendar"
                ? "bg-foreground text-background"
                : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setViewMode("summary")}
            className={`flex-1 sm:flex-none px-3 py-1 rounded text-sm ${
              viewMode === "summary"
                ? "bg-foreground text-background"
                : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Summary
          </button>
        </div>
      </div>

      {viewMode === "calendar" && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentYear(currentYear - 1)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ←
            </button>
            <input
              type="number"
              value={currentYear}
              onChange={(e) => {
                const year = Number.parseInt(e.target.value, 10);
                if (!Number.isNaN(year) && year > 0) {
                  setCurrentYear(year);
                }
              }}
              className="font-semibold w-20 text-center px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            />
            {calendar.useEras && (
              <span className="font-semibold text-sm sm:text-base">
                {currentEra === "after"
                  ? calendar.eraNames?.after || "AD"
                  : calendar.eraNames?.before || "BC"}
              </span>
            )}
            <button
              type="button"
              onClick={() => setCurrentYear(currentYear + 1)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              →
            </button>
          </div>
          {calendar.useEras && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentEra("before")}
                className={`px-3 py-1 rounded text-sm ${
                  currentEra === "before"
                    ? "bg-foreground text-background"
                    : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {calendar.eraNames?.before || "BC"}
              </button>
              <button
                type="button"
                onClick={() => setCurrentEra("after")}
                className={`px-3 py-1 rounded text-sm ${
                  currentEra === "after"
                    ? "bg-foreground text-background"
                    : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {calendar.eraNames?.after || "AD"}
              </button>
            </div>
          )}
          {isLeapYear(currentYear) && (
            <span className="text-xs sm:text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              Leap Year
            </span>
          )}
        </div>
      )}

      {viewMode === "summary" ? (
        <SummaryView
          calendar={calendar}
          entries={entries}
          onDateClick={(date: string) => {
            const parts = date.split(":");
            if (parts.length === 4) {
              const [era, year] = parts;
              setCurrentEra(era as "before" | "after");
              setCurrentYear(Number(year));
            }
            setSelectedDate(date);
            setViewMode("calendar");
          }}
        />
      ) : (
        <>
          {selectedDate && (
            <div className="lg:hidden mb-4 sticky top-0 z-10 bg-white dark:bg-gray-900 pb-4">
              <DiaryEntryEditor
                entry={selectedEntry}
                selectedDate={selectedDate}
                calendar={calendar}
                onSave={handleSaveEntry}
                onClose={() => setSelectedDate(null)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            <div className="space-y-4 sm:space-y-6">
              {calendar.months.map((month, monthIndex) => (
                <div
                  key={month.name}
                  className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 sm:p-4"
                >
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">
                    {month.name}
                  </h3>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from(
                      { length: getMonthDays(monthIndex) },
                      (_, i) => i + 1,
                    ).map((day) => {
                      const dateKey = getDateKey(
                        currentYear,
                        currentEra,
                        monthIndex,
                        day,
                      );
                      const entry = getEntry(monthIndex, day);
                      const hasEntry = entry && entry.content.trim().length > 0;
                      const isSelected = selectedDate === dateKey;

                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => handleDateClick(monthIndex, day)}
                          className={`aspect-square p-1 sm:p-2 text-xs sm:text-sm rounded ${
                            isSelected
                              ? "bg-foreground text-background"
                              : hasEntry
                                ? "bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-4">
                {selectedDate ? (
                  <DiaryEntryEditor
                    entry={selectedEntry}
                    selectedDate={selectedDate}
                    calendar={calendar}
                    onSave={handleSaveEntry}
                    onClose={() => setSelectedDate(null)}
                  />
                ) : (
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center text-gray-500">
                    Select a date to view or add a diary entry
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryView({
  calendar,
  entries,
  onDateClick,
}: {
  calendar: CalendarConfig;
  entries: DiaryEntry[];
  onDateClick: (date: string) => void;
}) {
  const entriesWithContent = entries.filter((e) => e.content.trim().length > 0);

  const getDateLabel = (dateKey: string): string => {
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
  };

  const sortedEntries = [...entriesWithContent].sort((a, b) => {
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

  if (sortedEntries.length === 0) {
    return (
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center text-gray-500">
        No diary entries yet. Switch to Calendar view to add some.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedEntries.map((entry) => (
        <button
          type="button"
          key={entry.date}
          className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer text-left w-full"
          onClick={() => onDateClick(entry.date)}
        >
          <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
            {getDateLabel(entry.date)}
          </h3>
          <p className="text-sm whitespace-pre-wrap line-clamp-3">
            {entry.content}
          </p>
        </button>
      ))}
    </div>
  );
}

function DiaryEntryEditor({
  entry,
  selectedDate,
  calendar,
  onSave,
  onClose,
}: {
  entry: DiaryEntry | null | undefined;
  selectedDate: string;
  calendar: CalendarConfig;
  onSave: (content: string) => void;
  onClose: () => void;
}) {
  const [content, setContent] = useState(entry?.content || "");

  useEffect(() => {
    setContent(entry?.content || "");
  }, [entry?.content]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(content);
    }, 300);

    return () => clearTimeout(timer);
  }, [content, onSave]);

  const getDateLabel = (): string => {
    const parts = selectedDate.split(":");
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
    const [monthIndex, day] = selectedDate.split("-").map(Number);
    const month = calendar.months[monthIndex];
    return `${month?.name || "Unknown"} ${day}`;
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 sm:p-4">
      <div className="flex justify-between items-start sm:items-center mb-3 sm:mb-4">
        <div>
          <h3 className="font-semibold text-sm sm:text-base">Diary Entry</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {getDateLabel()}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
        >
          ✕
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-48 sm:h-64 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 resize-none text-sm"
        placeholder="Write your diary entry here..."
      />
    </div>
  );
}

const CALENDAR_TEMPLATES = {
  gregorian: {
    name: "Gregorian Calendar",
    months: [
      { name: "January", days: 31 },
      { name: "February", days: 28, leapYearDays: 29 },
      { name: "March", days: 31 },
      { name: "April", days: 30 },
      { name: "May", days: 31 },
      { name: "June", days: 30 },
      { name: "July", days: 31 },
      { name: "August", days: 31 },
      { name: "September", days: 30 },
      { name: "October", days: 31 },
      { name: "November", days: 30 },
      { name: "December", days: 31 },
    ],
    leapYearRule: { type: "gregorian" as const },
    useEras: true,
    eraNames: { before: "BC", after: "AD" },
  },
  harptos: {
    name: "Calendar of Harptos",
    months: [
      { name: "Hammer", days: 30 },
      { name: "Midwinter", days: 1 },
      { name: "Alturiak", days: 30 },
      { name: "Ches", days: 30 },
      { name: "Tarsakh", days: 30 },
      { name: "Greengrass", days: 1 },
      { name: "Mirtul", days: 30 },
      { name: "Kythorn", days: 30 },
      { name: "Flamerule", days: 30 },
      { name: "Midsummer", days: 1 },
      { name: "Eleasias", days: 30 },
      { name: "Eleint", days: 30 },
      { name: "Highharvestide", days: 1 },
      { name: "Marpenoth", days: 30 },
      { name: "Uktar", days: 30 },
      { name: "Feast of the Moon", days: 1 },
      { name: "Nightal", days: 30 },
    ],
  },
  eberron: {
    name: "Eberron Calendar",
    months: [
      { name: "Zarantyr", days: 28 },
      { name: "Olarune", days: 28 },
      { name: "Therendor", days: 28 },
      { name: "Eyre", days: 28 },
      { name: "Dravago", days: 28 },
      { name: "Nymm", days: 28 },
      { name: "Lharvion", days: 28 },
      { name: "Barrakas", days: 28 },
      { name: "Rhaan", days: 28 },
      { name: "Sypheros", days: 28 },
      { name: "Aryth", days: 28 },
      { name: "Vult", days: 28 },
    ],
  },
  exandrian: {
    name: "Exandrian Calendar",
    months: [
      { name: "Horisal", days: 29 },
      { name: "Misuthar", days: 30 },
      { name: "Dualahei", days: 30 },
      { name: "Thunsheer", days: 31 },
      { name: "Unndilar", days: 28 },
      { name: "Brussendar", days: 31 },
      { name: "Sydenstar", days: 32 },
      { name: "Fessuran", days: 29 },
      { name: "Quen'pillar", days: 27 },
      { name: "Cuersaar", days: 29 },
      { name: "Duscar", days: 32 },
    ],
  },
  golarion: {
    name: "Golarion Calendar",
    months: [
      { name: "Abadius", days: 31 },
      { name: "Calistril", days: 28 },
      { name: "Pharast", days: 31 },
      { name: "Gozran", days: 30 },
      { name: "Desnus", days: 31 },
      { name: "Sarenith", days: 30 },
      { name: "Erastus", days: 31 },
      { name: "Arodus", days: 31 },
      { name: "Rova", days: 30 },
      { name: "Lamashan", days: 31 },
      { name: "Neth", days: 30 },
      { name: "Kuthona", days: 31 },
    ],
    useEras: true,
    eraNames: { before: "AR", after: "AR" },
  },
  imperial: {
    name: "Imperial Calendar (Warhammer)",
    months: [
      { name: "Hexenstag", days: 1 },
      { name: "Nachexen", days: 32 },
      { name: "Jahrdrung", days: 33 },
      { name: "Mitterfruhl", days: 1 },
      { name: "Pflugzeit", days: 33 },
      { name: "Sigmarzeit", days: 33 },
      { name: "Sommerzeit", days: 33 },
      { name: "Sonnstill", days: 1 },
      { name: "Vorgeheim", days: 33 },
      { name: "Geheimnistag", days: 1 },
      { name: "Nachgeheim", days: 32 },
      { name: "Erntezeit", days: 33 },
      { name: "Mittherbst", days: 1 },
      { name: "Brauzeit", days: 33 },
      { name: "Kaldezeit", days: 33 },
      { name: "Ulriczeit", days: 33 },
      { name: "Mondstille", days: 1 },
      { name: "Vorhexen", days: 33 },
    ],
  },
  tamrielic: {
    name: "Tamrielic Calendar",
    months: [
      { name: "Morning Star", days: 31 },
      { name: "Sun's Dawn", days: 28 },
      { name: "First Seed", days: 31 },
      { name: "Rain's Hand", days: 30 },
      { name: "Second Seed", days: 31 },
      { name: "Mid Year", days: 30 },
      { name: "Sun's Height", days: 31 },
      { name: "Last Seed", days: 31 },
      { name: "Hearthfire", days: 30 },
      { name: "Frostfall", days: 31 },
      { name: "Sun's Dusk", days: 30 },
      { name: "Evening Star", days: 31 },
    ],
  },
  shire: {
    name: "Shire Calendar",
    months: [
      { name: "Afteryule", days: 30 },
      { name: "Solmath", days: 30 },
      { name: "Rethe", days: 30 },
      { name: "Astron", days: 30 },
      { name: "Thrimidge", days: 30 },
      { name: "Forelithe", days: 30 },
      { name: "Afterlithe", days: 30 },
      { name: "Wedmath", days: 30 },
      { name: "Halimath", days: 30 },
      { name: "Winterfilth", days: 30 },
      { name: "Blotmath", days: 30 },
      { name: "Foreyule", days: 30 },
    ],
  },
  lunar: {
    name: "Lunar Calendar (Islamic)",
    months: [
      { name: "Muharram", days: 30 },
      { name: "Safar", days: 29 },
      { name: "Rabi' al-Awwal", days: 30 },
      { name: "Rabi' al-Thani", days: 29 },
      { name: "Jumada al-Awwal", days: 30 },
      { name: "Jumada al-Thani", days: 29 },
      { name: "Rajab", days: 30 },
      { name: "Sha'ban", days: 29 },
      { name: "Ramadan", days: 30 },
      { name: "Shawwal", days: 29 },
      { name: "Dhu al-Qi'dah", days: 30 },
      { name: "Dhu al-Hijjah", days: 29 },
    ],
    useEras: true,
    eraNames: { before: "BH", after: "AH" },
  },
  hebrew: {
    name: "Hebrew Calendar",
    months: [
      { name: "Nisan", days: 30 },
      { name: "Iyar", days: 29 },
      { name: "Sivan", days: 30 },
      { name: "Tammuz", days: 29 },
      { name: "Av", days: 30 },
      { name: "Elul", days: 29 },
      { name: "Tishrei", days: 30 },
      { name: "Cheshvan", days: 29 },
      { name: "Kislev", days: 30 },
      { name: "Tevet", days: 29 },
      { name: "Shevat", days: 30 },
      { name: "Adar", days: 29 },
    ],
  },
};

function CreateCalendarModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (calendar: CalendarConfig) => void;
}) {
  const [name, setName] = useState("");
  const [months, setMonths] = useState<
    { name: string; days: number; leapYearDays?: number }[]
  >([{ name: "Month 1", days: 30 }]);
  const [useTemplate, setUseTemplate] = useState(false);
  const [useEras, setUseEras] = useState(false);
  const [eraNameBefore, setEraNameBefore] = useState("BC");
  const [eraNameAfter, setEraNameAfter] = useState("AD");
  const [leapYearType, setLeapYearType] = useState<"none" | "gregorian">(
    "none",
  );

  const handleTemplateSelect = (
    templateKey: keyof typeof CALENDAR_TEMPLATES,
  ) => {
    const template = CALENDAR_TEMPLATES[templateKey];
    setName(template.name);
    setMonths(template.months);
    if ("leapYearRule" in template && template.leapYearRule) {
      setLeapYearType(template.leapYearRule.type);
    }
    if ("useEras" in template && template.useEras) {
      setUseEras(true);
      if ("eraNames" in template && template.eraNames) {
        setEraNameBefore(template.eraNames.before);
        setEraNameAfter(template.eraNames.after);
      }
    }
    setUseTemplate(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const calendar: CalendarConfig = {
      id: Date.now().toString(),
      name: name.trim(),
      months,
      leapYearRule:
        leapYearType === "none" ? undefined : { type: leapYearType },
      useEras: useEras || undefined,
      eraNames: useEras
        ? { before: eraNameBefore, after: eraNameAfter }
        : undefined,
    };
    onSave(calendar);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Create Calendar</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
          >
            ✕
          </button>
        </div>

        {!useTemplate && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Choose a template</h3>

            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              REAL-WORLD
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleTemplateSelect("gregorian")}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Gregorian Calendar
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Standard 12-month calendar
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect("lunar")}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Lunar Calendar
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Islamic/Hijri calendar
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect("hebrew")}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Hebrew Calendar
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Traditional Jewish calendar
                </div>
              </button>
            </div>

            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              FANTASY
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleTemplateSelect("harptos")}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Calendar of Harptos
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Forgotten Realms (D&D)
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect("eberron")}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Eberron Calendar
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  12 months of 28 days (D&D)
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect("exandrian")}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Exandrian Calendar
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Critical Role setting
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect("golarion")}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Golarion Calendar
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Pathfinder setting
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect("imperial")}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Imperial Calendar
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Warhammer Fantasy
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect("tamrielic")}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Tamrielic Calendar
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Elder Scrolls setting
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect("shire")}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Shire Calendar
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Lord of the Rings
                </div>
              </button>
            </div>

            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              CUSTOM
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseTemplate(true)}
                className="p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold text-sm sm:text-base">
                  Custom Calendar
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Create your own
                </div>
              </button>
            </div>
          </div>
        )}

        {useTemplate && (
          <form onSubmit={handleSubmit}>
            <button
              type="button"
              onClick={() => setUseTemplate(false)}
              className="mb-4 text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              ← Back to templates
            </button>
            <div className="mb-4">
              <label
                className="block text-sm font-semibold mb-2"
                htmlFor="calendar-name"
              >
                Calendar Name
              </label>
              <input
                id="calendar-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                placeholder="My Custom Calendar"
              />
            </div>

            <div className="mb-4">
              <div className="block text-sm font-semibold mb-2">Months</div>
              {months.map((month, index) => (
                <div key={month.name} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={month.name}
                    onChange={(e) => {
                      const newMonths = [...months];
                      newMonths[index].name = e.target.value;
                      setMonths(newMonths);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                    placeholder="Month name"
                  />
                  <input
                    type="number"
                    min="1"
                    value={month.days}
                    onChange={(e) => {
                      const newMonths = [...months];
                      newMonths[index].days =
                        Number.parseInt(e.target.value) || 1;
                      setMonths(newMonths);
                    }}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                    placeholder="Days"
                  />
                  {leapYearType !== "none" && (
                    <input
                      type="number"
                      min="1"
                      value={month.leapYearDays || ""}
                      onChange={(e) => {
                        const newMonths = [...months];
                        const val = Number.parseInt(e.target.value);
                        if (val) {
                          newMonths[index] = {
                            ...newMonths[index],
                            leapYearDays: val,
                          };
                        } else {
                          const { leapYearDays: _leapYearDays, ...rest } =
                            newMonths[index];
                          newMonths[index] = rest as typeof month;
                        }
                        setMonths(newMonths);
                      }}
                      className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                      placeholder="Leap"
                    />
                  )}
                  {months.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setMonths(months.filter((_, i) => i !== index))
                      }
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setMonths([
                    ...months,
                    { name: `Month ${months.length + 1}`, days: 30 },
                  ])
                }
                className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Add Month
              </button>
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-semibold mb-2"
                htmlFor="leap-year-rule"
              >
                Leap Year Rule
              </label>
              <select
                id="leap-year-rule"
                value={leapYearType}
                onChange={(e) =>
                  setLeapYearType(e.target.value as "none" | "gregorian")
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
              >
                <option value="none">None</option>
                <option value="gregorian">
                  Gregorian (every 4 years, except centuries unless divisible by
                  400)
                </option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useEras}
                  onChange={(e) => setUseEras(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">Use Eras (BC/AD)</span>
              </label>
            </div>

            {useEras && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    htmlFor="era-before"
                  >
                    Before Era Name
                  </label>
                  <input
                    id="era-before"
                    type="text"
                    value={eraNameBefore}
                    onChange={(e) => setEraNameBefore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                    placeholder="BC"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    htmlFor="era-after"
                  >
                    After Era Name
                  </label>
                  <input
                    id="era-after"
                    type="text"
                    value={eraNameAfter}
                    onChange={(e) => setEraNameAfter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                    placeholder="AD"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-foreground text-background rounded hover:opacity-80"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

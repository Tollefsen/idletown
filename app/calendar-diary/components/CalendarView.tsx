import { useEffect, useState } from "react";
import { storage } from "../storage";
import type { CalendarConfig, DiaryEntry } from "../types";
import { getDateKey, getMonthDays, isLeapYear } from "../utils";
import { DiaryEntryEditor } from "./DiaryEntryEditor";
import { SummaryView } from "./SummaryView";

type CalendarViewProps = {
  calendar: CalendarConfig;
};

export function CalendarView({ calendar }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "summary">("calendar");
  const [currentYear, setCurrentYear] = useState<number>(1);
  const [currentEra, setCurrentEra] = useState<"before" | "after">("after");

  useEffect(() => {
    setEntries(storage.getEntries(calendar.id));
  }, [calendar.id]);

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
          {isLeapYear(currentYear, calendar.leapYearRule) && (
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
                      {
                        length: getMonthDays(calendar, monthIndex, currentYear),
                      },
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

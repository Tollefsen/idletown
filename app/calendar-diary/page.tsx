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

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline mb-2 inline-block"
          >
            ← Back to Idle Town
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Calendar Diary</h1>
            <button
              onClick={() => setShowCreateCalendar(true)}
              className="px-4 py-2 bg-foreground text-background rounded hover:opacity-80"
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
          <div className="flex gap-8">
            <aside className="w-64">
              <h2 className="text-sm font-semibold mb-2">Your Calendars</h2>
              <ul className="space-y-1">
                {calendars.map((calendar) => (
                  <li key={calendar.id}>
                    {editingCalendarId === calendar.id ? (
                      <input
                        type="text"
                        defaultValue={calendar.name}
                        autoFocus
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
                          onClick={() => setSelectedCalendarId(calendar.id)}
                          className="flex-1 text-left"
                        >
                          {calendar.name}
                        </button>
                        <button
                          onClick={() => setEditingCalendarId(calendar.id)}
                          className="ml-2 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Rename calendar"
                        >
                          ✏️
                        </button>
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

  useEffect(() => {
    setEntries(storage.getEntries(calendar.id));
  }, [calendar.id]);

  const getDateKey = (monthIndex: number, day: number): string => {
    return `${monthIndex}-${day}`;
  };

  const getEntry = (
    monthIndex: number,
    day: number,
  ): DiaryEntry | undefined => {
    const dateKey = getDateKey(monthIndex, day);
    return entries.find((e) => e.date === dateKey);
  };

  const handleDateClick = (monthIndex: number, day: number) => {
    setSelectedDate(getDateKey(monthIndex, day));
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{calendar.name}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1 rounded ${
              viewMode === "calendar"
                ? "bg-foreground text-background"
                : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode("summary")}
            className={`px-3 py-1 rounded ${
              viewMode === "summary"
                ? "bg-foreground text-background"
                : "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Summary
          </button>
        </div>
      </div>

      {viewMode === "summary" ? (
        <SummaryView
          calendar={calendar}
          entries={entries}
          onDateClick={(date: string) => {
            setSelectedDate(date);
            setViewMode("calendar");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {calendar.months.map((month, monthIndex) => (
              <div
                key={monthIndex}
                className="border border-gray-300 dark:border-gray-700 rounded-lg p-4"
              >
                <h3 className="font-semibold mb-3">{month.name}</h3>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: month.days }, (_, i) => i + 1).map(
                    (day) => {
                      const dateKey = getDateKey(monthIndex, day);
                      const entry = getEntry(monthIndex, day);
                      const hasEntry = entry && entry.content.trim().length > 0;
                      const isSelected = selectedDate === dateKey;

                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(monthIndex, day)}
                          className={`aspect-square p-2 text-sm rounded ${
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
                    },
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            {selectedDate ? (
              <DiaryEntryEditor
                entry={selectedEntry}
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
    const [monthIndex, day] = dateKey.split("-").map(Number);
    const month = calendar.months[monthIndex];
    return `${month?.name || "Unknown"} ${day}`;
  };

  const sortedEntries = [...entriesWithContent].sort((a, b) => {
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
        <div
          key={entry.date}
          className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
          onClick={() => onDateClick(entry.date)}
        >
          <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
            {getDateLabel(entry.date)}
          </h3>
          <p className="text-sm whitespace-pre-wrap line-clamp-3">
            {entry.content}
          </p>
        </div>
      ))}
    </div>
  );
}

function DiaryEntryEditor({
  entry,
  onSave,
  onClose,
}: {
  entry: DiaryEntry | null | undefined;
  onSave: (content: string) => void;
  onClose: () => void;
}) {
  const [content, setContent] = useState(entry?.content || "");

  useEffect(() => {
    setContent(entry?.content || "");
  }, [entry]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(content);
    }, 300);

    return () => clearTimeout(timer);
  }, [content, onSave]);

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Diary Entry</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 resize-none"
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
      { name: "February", days: 28 },
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
};

function CreateCalendarModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (calendar: CalendarConfig) => void;
}) {
  const [name, setName] = useState("");
  const [months, setMonths] = useState([{ name: "Month 1", days: 30 }]);
  const [useTemplate, setUseTemplate] = useState(false);

  const handleTemplateSelect = (
    templateKey: keyof typeof CALENDAR_TEMPLATES,
  ) => {
    const template = CALENDAR_TEMPLATES[templateKey];
    setName(template.name);
    setMonths(template.months);
    setUseTemplate(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const calendar: CalendarConfig = {
      id: Date.now().toString(),
      name: name.trim(),
      months,
    };
    onSave(calendar);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create Calendar</h2>

        {!useTemplate && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Choose a template</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTemplateSelect("gregorian")}
                className="p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold">Gregorian Calendar</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Standard 12-month calendar
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTemplateSelect("harptos")}
                className="p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold">Calendar of Harptos</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Forgotten Realms calendar
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUseTemplate(true)}
                className="p-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="font-semibold">Custom Calendar</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Create your own
                </div>
              </button>
            </div>
          </div>
        )}

        {useTemplate && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Calendar Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                placeholder="My Custom Calendar"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Months</label>
              {months.map((month, index) => (
                <div key={index} className="flex gap-2 mb-2">
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

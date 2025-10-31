"use client";

import { useEffect, useState } from "react";
import { BackLink } from "../components/BackLink";
import { Button } from "../components/Button";
import { MESSAGES } from "../config/constants";
import { CalendarView } from "./components/CalendarView";
import { CreateCalendarModal } from "./components/CreateCalendarModal";
import { storage } from "./storage";
import type { CalendarConfig } from "./types";

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
    if (!confirm(MESSAGES.confirmations.deleteCalendar)) {
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
          <BackLink className="mb-2" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">Calendar Diary</h1>
            <Button
              variant="primary"
              onClick={() => setShowCreateCalendar(true)}
              className="w-full sm:w-auto"
            >
              Create Calendar
            </Button>
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

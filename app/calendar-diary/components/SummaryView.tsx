import type { CalendarConfig, DiaryEntry } from "../types";
import { getDateLabel, sortEntries } from "../utils";

type SummaryViewProps = {
  calendar: CalendarConfig;
  entries: DiaryEntry[];
  onDateClick: (date: string) => void;
};

export function SummaryView({
  calendar,
  entries,
  onDateClick,
}: SummaryViewProps) {
  const entriesWithContent = entries.filter((e) => e.content.trim().length > 0);
  const sortedEntries = sortEntries(entriesWithContent);

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
            {getDateLabel(entry.date, calendar)}
          </h3>
          <p className="text-sm whitespace-pre-wrap line-clamp-3">
            {entry.content}
          </p>
        </button>
      ))}
    </div>
  );
}

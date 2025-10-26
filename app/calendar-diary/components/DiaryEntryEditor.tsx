import { useEffect, useState } from "react";
import type { CalendarConfig, DiaryEntry } from "../types";
import { getDateLabel } from "../utils";

type DiaryEntryEditorProps = {
  entry: DiaryEntry | null | undefined;
  selectedDate: string;
  calendar: CalendarConfig;
  onSave: (content: string) => void;
  onClose: () => void;
};

export function DiaryEntryEditor({
  entry,
  selectedDate,
  calendar,
  onSave,
  onClose,
}: DiaryEntryEditorProps) {
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

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 sm:p-4">
      <div className="flex justify-between items-start sm:items-center mb-3 sm:mb-4">
        <div>
          <h3 className="font-semibold text-sm sm:text-base">Diary Entry</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {getDateLabel(selectedDate, calendar)}
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

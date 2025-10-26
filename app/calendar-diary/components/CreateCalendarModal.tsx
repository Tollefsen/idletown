import { useState } from "react";
import { CALENDAR_TEMPLATES } from "../templates";
import type { CalendarConfig, MonthConfig } from "../types";

type CreateCalendarModalProps = {
  onClose: () => void;
  onSave: (calendar: CalendarConfig) => void;
};

export function CreateCalendarModal({
  onClose,
  onSave,
}: CreateCalendarModalProps) {
  const [name, setName] = useState("");
  const [months, setMonths] = useState<MonthConfig[]>([
    { name: "Month 1", days: 30 },
  ]);
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
      if (template.leapYearRule.type !== "custom") {
        setLeapYearType(template.leapYearRule.type);
      }
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
                          newMonths[index] = rest as MonthConfig;
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

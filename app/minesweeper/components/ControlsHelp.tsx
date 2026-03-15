"use client";

export function ControlsHelp() {
  return (
    <div className="text-xs text-stone-500 dark:text-stone-400 space-y-1">
      <div className="flex gap-4 justify-center">
        <span>
          <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-[10px] font-mono">
            WASD
          </kbd>{" "}
          /{" "}
          <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-[10px] font-mono">
            Arrows
          </kbd>{" "}
          Move
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-[10px] font-mono">
            Space
          </kbd>{" "}
          /{" "}
          <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-[10px] font-mono">
            F
          </kbd>{" "}
          Flag
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-[10px] font-mono">
            R
          </kbd>{" "}
          Restart
        </span>
      </div>
    </div>
  );
}

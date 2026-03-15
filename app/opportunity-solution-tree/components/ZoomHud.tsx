"use client";

interface ZoomHudProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const buttonClass =
  "w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium";

export function ZoomHud({ zoom, onZoomIn, onZoomOut, onReset }: ZoomHudProps) {
  const pct = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-4 right-4 flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden select-none">
      <button type="button" onClick={onZoomOut} className={buttonClass}>
        −
      </button>

      <button
        type="button"
        onClick={onReset}
        className="px-2 h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[3.5rem] tabular-nums"
        title="Reset to 100%"
      >
        {pct}%
      </button>

      <button type="button" onClick={onZoomIn} className={buttonClass}>
        +
      </button>
    </div>
  );
}

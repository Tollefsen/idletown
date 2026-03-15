"use client";

import type { Direction } from "../lib/types";

interface TouchControlsProps {
  onMove: (direction: Direction) => void;
  onFlag: () => void;
  disabled: boolean;
}

function DpadButton({
  children,
  onClick,
  className = "",
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  label: string;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`w-12 h-12 flex items-center justify-center bg-stone-300 dark:bg-stone-600 active:bg-stone-400 dark:active:bg-stone-500 rounded-lg text-lg font-bold select-none touch-manipulation disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function TouchControls({
  onMove,
  onFlag,
  disabled,
}: TouchControlsProps) {
  return (
    <div className="flex items-center gap-8 sm:hidden">
      <div className="grid grid-cols-3 grid-rows-3 gap-1">
        <div />
        <DpadButton
          onClick={() => onMove("up")}
          label="Move up"
          disabled={disabled}
        >
          {"\u25B2"}
        </DpadButton>
        <div />
        <DpadButton
          onClick={() => onMove("left")}
          label="Move left"
          disabled={disabled}
        >
          {"\u25C0"}
        </DpadButton>
        <div className="w-12 h-12" />
        <DpadButton
          onClick={() => onMove("right")}
          label="Move right"
          disabled={disabled}
        >
          {"\u25B6"}
        </DpadButton>
        <div />
        <DpadButton
          onClick={() => onMove("down")}
          label="Move down"
          disabled={disabled}
        >
          {"\u25BC"}
        </DpadButton>
        <div />
      </div>
      <button
        type="button"
        onClick={onFlag}
        disabled={disabled}
        className="w-16 h-16 flex items-center justify-center bg-amber-400 dark:bg-amber-600 active:bg-amber-500 dark:active:bg-amber-500 rounded-xl text-2xl font-bold select-none touch-manipulation disabled:opacity-50"
        aria-label="Place flag"
      >
        {"\uD83D\uDEA9"}
      </button>
    </div>
  );
}

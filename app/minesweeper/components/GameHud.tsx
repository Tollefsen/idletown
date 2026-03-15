"use client";

import type { GameStatus } from "../lib/types";

interface GameHudProps {
  mines: number;
  flagsPlaced: number;
  elapsedTime: number;
  status: GameStatus;
  revealedCount: number;
  totalSafeCells: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function GameHud({
  mines,
  flagsPlaced,
  elapsedTime,
  status,
  revealedCount,
  totalSafeCells,
}: GameHudProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 bg-stone-300 dark:bg-stone-700 rounded-lg font-mono text-sm min-w-[280px]">
      <div className="flex items-center gap-1.5">
        <span>{"\uD83D\uDEA9"}</span>
        <span>
          {flagsPlaced}/{mines}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span>{"\u23F1\uFE0F"}</span>
        <span>{formatTime(elapsedTime)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span>{"\uD83D\uDC63"}</span>
        <span>
          {revealedCount}/{totalSafeCells}
        </span>
      </div>
      {status === "won" && (
        <span className="text-green-600 dark:text-green-400 font-bold">
          CLEAR!
        </span>
      )}
      {status === "lost" && (
        <span className="text-red-600 dark:text-red-400 font-bold">BOOM!</span>
      )}
    </div>
  );
}

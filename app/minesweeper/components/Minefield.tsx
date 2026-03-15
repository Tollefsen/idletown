"use client";

import type { Cell, Direction, Position } from "../lib/types";

interface MinefieldProps {
  grid: Cell[][];
  player: Position;
  facing: Direction;
  gameOver: boolean;
}

const DIRECTION_ARROWS: Record<Direction, string> = {
  up: "\u25B2",
  down: "\u25BC",
  left: "\u25C0",
  right: "\u25B6",
};

const NUMBER_COLORS: Record<number, string> = {
  1: "text-blue-600",
  2: "text-green-600",
  3: "text-red-600",
  4: "text-purple-700",
  5: "text-amber-800",
  6: "text-teal-600",
  7: "text-gray-800",
  8: "text-gray-500",
};

function getCellContent(cell: Cell): string {
  if (cell.state === "flagged") return "\uD83D\uDEA9";
  if (cell.state === "hidden") return "";
  if (cell.hasMine) return "\uD83D\uDCA5";
  if (cell.adjacentMines === 0) return "";
  return cell.adjacentMines.toString();
}

function getCellClasses(cell: Cell, isPlayerHere: boolean): string {
  const base =
    "flex items-center justify-center text-xs font-bold select-none transition-colors duration-100";

  if (isPlayerHere) {
    return `${base} bg-amber-300 dark:bg-amber-500`;
  }

  if (cell.state === "hidden" || cell.state === "flagged") {
    return `${base} bg-stone-400 dark:bg-stone-600 border-t-2 border-l-2 border-stone-300 dark:border-stone-500 border-b-2 border-r-2 border-stone-500 dark:border-stone-700`;
  }

  if (cell.hasMine) {
    return `${base} bg-red-500 dark:bg-red-700`;
  }

  return `${base} bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700`;
}

export function Minefield({ grid, player, facing, gameOver }: MinefieldProps) {
  const cols = grid[0]?.length ?? 0;

  const cells = grid.flatMap((row, r) =>
    row.map((cell, c) => ({
      cell,
      row: r,
      col: c,
      key: r * cols + c,
    })),
  );

  return (
    <div
      className="inline-grid gap-0 border-2 border-stone-600 dark:border-stone-400"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {cells.map(({ cell, row, col, key }) => {
        const isPlayer = row === player.row && col === player.col;
        const content = getCellContent(cell);
        const colorClass =
          cell.state === "revealed" && !cell.hasMine && cell.adjacentMines > 0
            ? (NUMBER_COLORS[cell.adjacentMines] ?? "")
            : "";

        return (
          <div
            key={key}
            className={getCellClasses(cell, isPlayer)}
            style={{
              width: "clamp(20px, 5vw, 32px)",
              height: "clamp(20px, 5vw, 32px)",
            }}
          >
            {isPlayer && !gameOver ? (
              <span className="relative flex items-center justify-center w-full h-full">
                <span className="text-sm leading-none">
                  {DIRECTION_ARROWS[facing]}
                </span>
                {cell.state === "revealed" &&
                  !cell.hasMine &&
                  cell.adjacentMines > 0 && (
                    <span
                      className={`absolute top-0 right-0.5 text-[8px] leading-none font-bold ${NUMBER_COLORS[cell.adjacentMines] ?? ""}`}
                    >
                      {cell.adjacentMines}
                    </span>
                  )}
              </span>
            ) : (
              <span className={colorClass}>{content}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

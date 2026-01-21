"use client";

import type { CellValue, Difficulty } from "../lib/types";

interface CellProps {
  value: CellValue;
  row: number;
  col: number;
  isGiven: boolean;
  isSelected: boolean;
  /** The value from the solver (shown after analysis) */
  solvedValue?: CellValue;
  /** The difficulty level that solved this cell */
  solveDifficulty?: Difficulty;
  onSelect: (row: number, col: number) => void;
  onChange: (value: CellValue) => void;
}

/**
 * Get the text color class based on cell state
 */
function getTextColorClass(
  isGiven: boolean,
  value: CellValue,
  solvedValue: CellValue | undefined,
  solveDifficulty: Difficulty | undefined,
): string {
  // Given cells are always bold black
  if (isGiven) {
    return "font-bold text-gray-900";
  }

  // User-entered value (not from solver)
  if (value !== null) {
    return "font-normal text-blue-600";
  }

  // Solver-placed value - color by difficulty
  if (solvedValue !== null && solveDifficulty) {
    switch (solveDifficulty) {
      case "easy":
        return "font-medium text-green-600";
      case "medium":
        return "font-medium text-yellow-600";
      case "hard":
        return "font-medium text-orange-500";
      case "expert":
      case "master":
        return "font-medium text-red-600";
      default:
        return "font-normal text-gray-600";
    }
  }

  // Empty cell
  return "font-normal text-gray-600";
}

export function Cell({
  value,
  row,
  col,
  isGiven,
  isSelected,
  solvedValue,
  solveDifficulty,
  onSelect,
  onChange,
}: CellProps) {
  // Determine border classes for 3x3 box grouping
  const borderClasses = [
    // Right border thicker at box boundaries
    col === 2 || col === 5
      ? "border-r-2 border-r-gray-800"
      : "border-r border-r-gray-300",
    // Bottom border thicker at box boundaries
    row === 2 || row === 5
      ? "border-b-2 border-b-gray-800"
      : "border-b border-b-gray-300",
    // Left border for first column
    col === 0 ? "border-l-2 border-l-gray-800" : "",
    // Top border for first row
    row === 0 ? "border-t-2 border-t-gray-800" : "",
    // Right border for last column
    col === 8 ? "border-r-2 border-r-gray-800" : "",
    // Bottom border for last row
    row === 8 ? "border-b-2 border-b-gray-800" : "",
  ].join(" ");

  // Display value: user value first, then solved value if available
  const displayValue = value ?? solvedValue ?? null;

  // Get text color class based on state
  const textColorClass = getTextColorClass(
    isGiven,
    value,
    solvedValue,
    solveDifficulty,
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Prevent given cells from being modified
    if (isGiven) {
      // Still allow arrow navigation
      if (
        !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        return;
      }
    }

    if (e.key >= "1" && e.key <= "9") {
      e.preventDefault();
      onChange(Number.parseInt(e.key, 10) as CellValue);
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      e.preventDefault();
      onChange(null);
    } else if (e.key === "ArrowUp" && row > 0) {
      e.preventDefault();
      onSelect(row - 1, col);
    } else if (e.key === "ArrowDown" && row < 8) {
      e.preventDefault();
      onSelect(row + 1, col);
    } else if (e.key === "ArrowLeft" && col > 0) {
      e.preventDefault();
      onSelect(row, col - 1);
    } else if (e.key === "ArrowRight" && col < 8) {
      e.preventDefault();
      onSelect(row, col + 1);
    }
  };

  return (
    <button
      type="button"
      className={`
        flex h-10 w-10 cursor-pointer items-center justify-center text-lg
        select-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
        sm:h-12 sm:w-12 sm:text-xl
        ${borderClasses}
        ${isSelected ? "bg-blue-100" : "bg-white hover:bg-gray-50"}
        ${textColorClass}
      `}
      onClick={() => onSelect(row, col)}
      onKeyDown={handleKeyDown}
      aria-label={`Row ${row + 1}, Column ${col + 1}${displayValue ? `, value ${displayValue}` : ", empty"}`}
    >
      {displayValue || ""}
    </button>
  );
}

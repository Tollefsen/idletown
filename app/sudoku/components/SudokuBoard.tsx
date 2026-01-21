"use client";

import { useCallback, useEffect, useRef } from "react";
import { toIndex } from "../lib/candidates";
import type { CellValue, Difficulty, SudokuGrid } from "../lib/types";
import { Cell } from "./Cell";

interface SudokuBoardProps {
  grid: SudokuGrid;
  selectedCell: { row: number; col: number } | null;
  /** The solved grid after analysis (null if not analyzed) */
  solvedGrid: SudokuGrid | null;
  /** Map of cell index -> difficulty that solved it */
  cellDifficulty: Map<number, Difficulty> | null;
  onSelectCell: (row: number, col: number) => void;
  onCellChange: (row: number, col: number, value: CellValue) => void;
}

export function SudokuBoard({
  grid,
  selectedCell,
  solvedGrid,
  cellDifficulty,
  onSelectCell,
  onCellChange,
}: SudokuBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  // Focus the board when a cell is selected
  useEffect(() => {
    if (selectedCell && boardRef.current) {
      const cellElements = boardRef.current.querySelectorAll("button");
      const cellIndex = toIndex(selectedCell.row, selectedCell.col);
      const cellElement = cellElements[cellIndex] as HTMLElement;
      if (cellElement) {
        cellElement.focus();
      }
    }
  }, [selectedCell]);

  const handleCellChange = useCallback(
    (row: number, col: number) => (value: CellValue) => {
      onCellChange(row, col, value);
    },
    [onCellChange],
  );

  return (
    <div ref={boardRef} className="inline-grid grid-cols-9 bg-gray-200">
      {grid.map((cell, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const isSelected =
          selectedCell?.row === row && selectedCell?.col === col;

        // Get solved value and difficulty for this cell (only if not given and not user-entered)
        const solvedValue =
          !cell.isGiven && cell.value === null && solvedGrid
            ? solvedGrid[index].value
            : undefined;
        const solveDifficulty =
          solvedValue !== undefined && cellDifficulty
            ? cellDifficulty.get(index)
            : undefined;

        return (
          <Cell
            key={`${row}-${col}`}
            value={cell.value}
            row={row}
            col={col}
            isGiven={cell.isGiven}
            isSelected={isSelected}
            solvedValue={solvedValue}
            solveDifficulty={solveDifficulty}
            onSelect={onSelectCell}
            onChange={handleCellChange(row, col)}
          />
        );
      })}
    </div>
  );
}

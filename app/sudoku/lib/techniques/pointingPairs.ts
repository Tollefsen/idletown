// Pointing Pairs/Triples - IMPLEMENTED
// When a candidate in a box is confined to a single row or column,
// that candidate can be eliminated from that row/column outside the box.

import { getBoxIndices, getColIndices, getRowIndices } from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

export const pointingPairs: Technique = {
  id: "pointing-pairs",
  name: "Pointing Pairs",
  difficulty: "medium",
  implemented: true,
  description:
    "When a candidate in a box is confined to a single row or column, it can be eliminated from that row/column outside the box.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    // Check each box
    for (let box = 0; box < 9; box++) {
      const boxIndices = getBoxIndices(box);
      const boxStartRow = Math.floor(box / 3) * 3;
      const boxStartCol = (box % 3) * 3;

      // For each digit
      for (let d = 1; d <= 9; d++) {
        const digit = d as Digit;

        // Find cells in this box that have this digit as a candidate
        const cellsWithDigit: number[] = [];
        for (const cellIdx of boxIndices) {
          const cell = grid[cellIdx];
          if (cell.value === null && cell.candidates.has(digit)) {
            cellsWithDigit.push(cellIdx);
          }
        }

        // Need at least 2 cells (pointing pair or triple)
        if (cellsWithDigit.length < 2 || cellsWithDigit.length > 3) continue;

        // Check if all cells are in the same row
        const rows = new Set(cellsWithDigit.map((idx) => grid[idx].row));
        if (rows.size === 1) {
          const row = Array.from(rows)[0];
          const rowIndices = getRowIndices(row);

          // Find eliminations in this row outside the box
          const eliminations: Array<{
            row: number;
            col: number;
            candidates: number[];
          }> = [];

          for (const cellIdx of rowIndices) {
            const cell = grid[cellIdx];
            // Skip cells in the same box
            if (cell.col >= boxStartCol && cell.col < boxStartCol + 3) continue;

            if (cell.value === null && cell.candidates.has(digit)) {
              eliminations.push({
                row: cell.row,
                col: cell.col,
                candidates: [digit],
              });
            }
          }

          if (eliminations.length > 0) {
            return {
              techniqueId: "pointing-pairs",
              placements: [],
              eliminations,
              description: `Pointing ${cellsWithDigit.length === 2 ? "Pair" : "Triple"}: ${digit} in Box ${box + 1} points along Row ${row + 1}`,
            };
          }
        }

        // Check if all cells are in the same column
        const cols = new Set(cellsWithDigit.map((idx) => grid[idx].col));
        if (cols.size === 1) {
          const col = Array.from(cols)[0];
          const colIndices = getColIndices(col);

          // Find eliminations in this column outside the box
          const eliminations: Array<{
            row: number;
            col: number;
            candidates: number[];
          }> = [];

          for (const cellIdx of colIndices) {
            const cell = grid[cellIdx];
            // Skip cells in the same box
            if (cell.row >= boxStartRow && cell.row < boxStartRow + 3) continue;

            if (cell.value === null && cell.candidates.has(digit)) {
              eliminations.push({
                row: cell.row,
                col: cell.col,
                candidates: [digit],
              });
            }
          }

          if (eliminations.length > 0) {
            return {
              techniqueId: "pointing-pairs",
              placements: [],
              eliminations,
              description: `Pointing ${cellsWithDigit.length === 2 ? "Pair" : "Triple"}: ${digit} in Box ${box + 1} points along Column ${col + 1}`,
            };
          }
        }
      }
    }

    return null;
  },
};

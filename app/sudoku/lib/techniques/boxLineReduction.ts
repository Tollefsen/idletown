// Box/Line Reduction - IMPLEMENTED
// When a candidate in a row/column is confined to a single box,
// that candidate can be eliminated from other cells in that box.
// (This is the inverse of Pointing Pairs)

import {
  getBoxIndex,
  getBoxIndices,
  getColIndices,
  getRowIndices,
} from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

export const boxLineReduction: Technique = {
  id: "box-line-reduction",
  name: "Box/Line Reduction",
  difficulty: "medium",
  implemented: true,
  description:
    "When a candidate in a row/column is confined to a single box, it can be eliminated from other cells in that box.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    // Check each row
    for (let row = 0; row < 9; row++) {
      const rowIndices = getRowIndices(row);

      for (let d = 1; d <= 9; d++) {
        const digit = d as Digit;

        // Find cells in this row that have this digit as a candidate
        const cellsWithDigit: number[] = [];
        for (const cellIdx of rowIndices) {
          const cell = grid[cellIdx];
          if (cell.value === null && cell.candidates.has(digit)) {
            cellsWithDigit.push(cellIdx);
          }
        }

        // Need 2-3 cells for this technique to apply
        if (cellsWithDigit.length < 2 || cellsWithDigit.length > 3) continue;

        // Check if all cells are in the same box
        const boxes = new Set(
          cellsWithDigit.map((idx) =>
            getBoxIndex(grid[idx].row, grid[idx].col),
          ),
        );

        if (boxes.size === 1) {
          const box = Array.from(boxes)[0];
          const boxIndices = getBoxIndices(box);

          // Find eliminations in this box outside the row
          const eliminations: Array<{
            row: number;
            col: number;
            candidates: number[];
          }> = [];

          for (const cellIdx of boxIndices) {
            const cell = grid[cellIdx];
            // Skip cells in the same row
            if (cell.row === row) continue;

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
              techniqueId: "box-line-reduction",
              placements: [],
              eliminations,
              description: `Box/Line Reduction: ${digit} in Row ${row + 1} is confined to Box ${box + 1}`,
            };
          }
        }
      }
    }

    // Check each column
    for (let col = 0; col < 9; col++) {
      const colIndices = getColIndices(col);

      for (let d = 1; d <= 9; d++) {
        const digit = d as Digit;

        // Find cells in this column that have this digit as a candidate
        const cellsWithDigit: number[] = [];
        for (const cellIdx of colIndices) {
          const cell = grid[cellIdx];
          if (cell.value === null && cell.candidates.has(digit)) {
            cellsWithDigit.push(cellIdx);
          }
        }

        // Need 2-3 cells for this technique to apply
        if (cellsWithDigit.length < 2 || cellsWithDigit.length > 3) continue;

        // Check if all cells are in the same box
        const boxes = new Set(
          cellsWithDigit.map((idx) =>
            getBoxIndex(grid[idx].row, grid[idx].col),
          ),
        );

        if (boxes.size === 1) {
          const box = Array.from(boxes)[0];
          const boxIndices = getBoxIndices(box);

          // Find eliminations in this box outside the column
          const eliminations: Array<{
            row: number;
            col: number;
            candidates: number[];
          }> = [];

          for (const cellIdx of boxIndices) {
            const cell = grid[cellIdx];
            // Skip cells in the same column
            if (cell.col === col) continue;

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
              techniqueId: "box-line-reduction",
              placements: [],
              eliminations,
              description: `Box/Line Reduction: ${digit} in Column ${col + 1} is confined to Box ${box + 1}`,
            };
          }
        }
      }
    }

    return null;
  },
};

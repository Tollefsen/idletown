// X-Wing - IMPLEMENTED
// When a candidate appears in exactly two cells in two different rows,
// and those cells are in the same two columns (forming a rectangle),
// that candidate can be eliminated from all other cells in those columns.
// (Also works with rows/columns swapped)

import { getColIndices, getRowIndices } from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

/**
 * Find cells in a row/column that contain a specific candidate
 */
function findCellsWithCandidate(
  grid: SudokuGrid,
  indices: number[],
  digit: Digit,
): number[] {
  return indices.filter((idx) => {
    const cell = grid[idx];
    return cell.value === null && cell.candidates.has(digit);
  });
}

export const xWing: Technique = {
  id: "x-wing",
  name: "X-Wing",
  difficulty: "expert",
  implemented: true,
  description:
    "A candidate appears in exactly two cells in two different rows, and these cells share the same two columns (forming a rectangle).",

  apply(grid: SudokuGrid): TechniqueResult | null {
    // Try X-Wing on rows (eliminate from columns)
    const rowResult = findXWingOnRows(grid);
    if (rowResult) return rowResult;

    // Try X-Wing on columns (eliminate from rows)
    const colResult = findXWingOnCols(grid);
    if (colResult) return colResult;

    return null;
  },
};

/**
 * Find X-Wing pattern on rows, eliminate from columns
 */
function findXWingOnRows(grid: SudokuGrid): TechniqueResult | null {
  for (let d = 1; d <= 9; d++) {
    const digit = d as Digit;

    // Find rows where this digit appears in exactly 2 cells
    const rowsWithTwoCells: Array<{ row: number; cols: number[] }> = [];

    for (let row = 0; row < 9; row++) {
      const rowIndices = getRowIndices(row);
      const cellsWithDigit = findCellsWithCandidate(grid, rowIndices, digit);

      if (cellsWithDigit.length === 2) {
        const cols = cellsWithDigit
          .map((idx) => grid[idx].col)
          .sort((a, b) => a - b);
        rowsWithTwoCells.push({ row, cols });
      }
    }

    // Need at least 2 rows to form an X-Wing
    if (rowsWithTwoCells.length < 2) continue;

    // Check all pairs of rows
    for (let i = 0; i < rowsWithTwoCells.length; i++) {
      for (let j = i + 1; j < rowsWithTwoCells.length; j++) {
        const row1 = rowsWithTwoCells[i];
        const row2 = rowsWithTwoCells[j];

        // Check if they share the same two columns
        if (row1.cols[0] === row2.cols[0] && row1.cols[1] === row2.cols[1]) {
          // Found an X-Wing! Eliminate from these columns in other rows
          const eliminations: Array<{
            row: number;
            col: number;
            candidates: number[];
          }> = [];

          for (const col of row1.cols) {
            const colIndices = getColIndices(col);
            for (const idx of colIndices) {
              const cell = grid[idx];
              // Skip cells in the X-Wing rows
              if (cell.row === row1.row || cell.row === row2.row) continue;

              if (cell.value === null && cell.candidates.has(digit)) {
                eliminations.push({
                  row: cell.row,
                  col: cell.col,
                  candidates: [digit],
                });
              }
            }
          }

          if (eliminations.length > 0) {
            return {
              techniqueId: "x-wing",
              placements: [],
              eliminations,
              description: `X-Wing: ${digit} in Rows ${row1.row + 1},${row2.row + 1} / Columns ${row1.cols[0] + 1},${row1.cols[1] + 1}`,
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Find X-Wing pattern on columns, eliminate from rows
 */
function findXWingOnCols(grid: SudokuGrid): TechniqueResult | null {
  for (let d = 1; d <= 9; d++) {
    const digit = d as Digit;

    // Find columns where this digit appears in exactly 2 cells
    const colsWithTwoCells: Array<{ col: number; rows: number[] }> = [];

    for (let col = 0; col < 9; col++) {
      const colIndices = getColIndices(col);
      const cellsWithDigit = findCellsWithCandidate(grid, colIndices, digit);

      if (cellsWithDigit.length === 2) {
        const rows = cellsWithDigit
          .map((idx) => grid[idx].row)
          .sort((a, b) => a - b);
        colsWithTwoCells.push({ col, rows });
      }
    }

    // Need at least 2 columns to form an X-Wing
    if (colsWithTwoCells.length < 2) continue;

    // Check all pairs of columns
    for (let i = 0; i < colsWithTwoCells.length; i++) {
      for (let j = i + 1; j < colsWithTwoCells.length; j++) {
        const col1 = colsWithTwoCells[i];
        const col2 = colsWithTwoCells[j];

        // Check if they share the same two rows
        if (col1.rows[0] === col2.rows[0] && col1.rows[1] === col2.rows[1]) {
          // Found an X-Wing! Eliminate from these rows in other columns
          const eliminations: Array<{
            row: number;
            col: number;
            candidates: number[];
          }> = [];

          for (const row of col1.rows) {
            const rowIndices = getRowIndices(row);
            for (const idx of rowIndices) {
              const cell = grid[idx];
              // Skip cells in the X-Wing columns
              if (cell.col === col1.col || cell.col === col2.col) continue;

              if (cell.value === null && cell.candidates.has(digit)) {
                eliminations.push({
                  row: cell.row,
                  col: cell.col,
                  candidates: [digit],
                });
              }
            }
          }

          if (eliminations.length > 0) {
            return {
              techniqueId: "x-wing",
              placements: [],
              eliminations,
              description: `X-Wing: ${digit} in Columns ${col1.col + 1},${col2.col + 1} / Rows ${col1.rows[0] + 1},${col1.rows[1] + 1}`,
            };
          }
        }
      }
    }
  }

  return null;
}

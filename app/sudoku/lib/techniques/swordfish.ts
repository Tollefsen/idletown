// Swordfish - IMPLEMENTED
// Extension of X-Wing to three rows and columns.
// When a candidate appears in 2-3 cells in exactly three rows,
// and those cells cover exactly three columns (and vice versa),
// that candidate can be eliminated from all other cells in those columns/rows.

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

/**
 * Check if array a is a subset of array b
 */
function isSubset(a: number[], b: number[]): boolean {
  return a.every((x) => b.includes(x));
}

/**
 * Get unique columns covered by multiple rows' candidate cells
 */
function getCoveredColumns(
  rows: Array<{ row: number; cols: number[] }>,
): number[] {
  const allCols = new Set<number>();
  for (const r of rows) {
    for (const c of r.cols) {
      allCols.add(c);
    }
  }
  return Array.from(allCols).sort((a, b) => a - b);
}

/**
 * Get unique rows covered by multiple columns' candidate cells
 */
function getCoveredRows(
  cols: Array<{ col: number; rows: number[] }>,
): number[] {
  const allRows = new Set<number>();
  for (const c of cols) {
    for (const r of c.rows) {
      allRows.add(r);
    }
  }
  return Array.from(allRows).sort((a, b) => a - b);
}

export const swordfish: Technique = {
  id: "swordfish",
  name: "Swordfish",
  difficulty: "expert",
  implemented: true,
  description:
    "Extension of X-Wing to three rows and columns. A candidate forms a specific pattern across three rows/columns.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    // Try Swordfish on rows (eliminate from columns)
    const rowResult = findSwordfishOnRows(grid);
    if (rowResult) return rowResult;

    // Try Swordfish on columns (eliminate from rows)
    const colResult = findSwordfishOnCols(grid);
    if (colResult) return colResult;

    return null;
  },
};

/**
 * Find Swordfish pattern on rows, eliminate from columns
 */
function findSwordfishOnRows(grid: SudokuGrid): TechniqueResult | null {
  for (let d = 1; d <= 9; d++) {
    const digit = d as Digit;

    // Find rows where this digit appears in 2-3 cells
    const eligibleRows: Array<{ row: number; cols: number[] }> = [];

    for (let row = 0; row < 9; row++) {
      const rowIndices = getRowIndices(row);
      const cellsWithDigit = findCellsWithCandidate(grid, rowIndices, digit);

      if (cellsWithDigit.length >= 2 && cellsWithDigit.length <= 3) {
        const cols = cellsWithDigit
          .map((idx) => grid[idx].col)
          .sort((a, b) => a - b);
        eligibleRows.push({ row, cols });
      }
    }

    // Need at least 3 rows for a Swordfish
    if (eligibleRows.length < 3) continue;

    // Check all combinations of 3 rows
    for (let i = 0; i < eligibleRows.length; i++) {
      for (let j = i + 1; j < eligibleRows.length; j++) {
        for (let k = j + 1; k < eligibleRows.length; k++) {
          const selectedRows = [
            eligibleRows[i],
            eligibleRows[j],
            eligibleRows[k],
          ];
          const coveredCols = getCoveredColumns(selectedRows);

          // For a valid Swordfish, the 3 rows must cover exactly 3 columns
          if (coveredCols.length !== 3) continue;

          // Each row's columns must be a subset of the 3 covered columns
          if (!selectedRows.every((r) => isSubset(r.cols, coveredCols)))
            continue;

          // Found a Swordfish! Eliminate from these columns in other rows
          const swordfishRows = selectedRows.map((r) => r.row);
          const eliminations: Array<{
            row: number;
            col: number;
            candidates: number[];
          }> = [];

          for (const col of coveredCols) {
            const colIndices = getColIndices(col);
            for (const idx of colIndices) {
              const cell = grid[idx];
              // Skip cells in the Swordfish rows
              if (swordfishRows.includes(cell.row)) continue;

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
              techniqueId: "swordfish",
              placements: [],
              eliminations,
              description: `Swordfish: ${digit} in Rows ${swordfishRows.map((r) => r + 1).join(",")} / Columns ${coveredCols.map((c) => c + 1).join(",")}`,
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Find Swordfish pattern on columns, eliminate from rows
 */
function findSwordfishOnCols(grid: SudokuGrid): TechniqueResult | null {
  for (let d = 1; d <= 9; d++) {
    const digit = d as Digit;

    // Find columns where this digit appears in 2-3 cells
    const eligibleCols: Array<{ col: number; rows: number[] }> = [];

    for (let col = 0; col < 9; col++) {
      const colIndices = getColIndices(col);
      const cellsWithDigit = findCellsWithCandidate(grid, colIndices, digit);

      if (cellsWithDigit.length >= 2 && cellsWithDigit.length <= 3) {
        const rows = cellsWithDigit
          .map((idx) => grid[idx].row)
          .sort((a, b) => a - b);
        eligibleCols.push({ col, rows });
      }
    }

    // Need at least 3 columns for a Swordfish
    if (eligibleCols.length < 3) continue;

    // Check all combinations of 3 columns
    for (let i = 0; i < eligibleCols.length; i++) {
      for (let j = i + 1; j < eligibleCols.length; j++) {
        for (let k = j + 1; k < eligibleCols.length; k++) {
          const selectedCols = [
            eligibleCols[i],
            eligibleCols[j],
            eligibleCols[k],
          ];
          const coveredRows = getCoveredRows(selectedCols);

          // For a valid Swordfish, the 3 columns must cover exactly 3 rows
          if (coveredRows.length !== 3) continue;

          // Each column's rows must be a subset of the 3 covered rows
          if (!selectedCols.every((c) => isSubset(c.rows, coveredRows)))
            continue;

          // Found a Swordfish! Eliminate from these rows in other columns
          const swordfishCols = selectedCols.map((c) => c.col);
          const eliminations: Array<{
            row: number;
            col: number;
            candidates: number[];
          }> = [];

          for (const row of coveredRows) {
            const rowIndices = getRowIndices(row);
            for (const idx of rowIndices) {
              const cell = grid[idx];
              // Skip cells in the Swordfish columns
              if (swordfishCols.includes(cell.col)) continue;

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
              techniqueId: "swordfish",
              placements: [],
              eliminations,
              description: `Swordfish: ${digit} in Columns ${swordfishCols.map((c) => c + 1).join(",")} / Rows ${coveredRows.map((r) => r + 1).join(",")}`,
            };
          }
        }
      }
    }
  }

  return null;
}

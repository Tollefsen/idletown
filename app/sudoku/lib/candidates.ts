// Candidate calculation and grid utilities

import type { Candidates, Digit, SudokuGrid, Unit } from "./types";

/** Convert row, col to flat array index */
export function toIndex(row: number, col: number): number {
  return row * 9 + col;
}

/** Convert flat array index to row, col */
export function fromIndex(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / 9),
    col: index % 9,
  };
}

/** Get the box index (0-8) for a given row, col */
export function getBoxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

/** Create an empty grid */
export function createEmptyGrid(): SudokuGrid {
  const grid: SudokuGrid = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      grid.push({
        value: null,
        candidates: new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]),
        isGiven: false,
        row,
        col,
        box: getBoxIndex(row, col),
      });
    }
  }
  return grid;
}

/** Parse a puzzle string (81 chars, 0 or . for empty) into a grid */
export function parseGrid(puzzleString: string): SudokuGrid {
  const grid = createEmptyGrid();
  const cleaned = puzzleString.replace(/[^0-9.]/g, "");

  for (let i = 0; i < 81 && i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char !== "0" && char !== ".") {
      const value = Number.parseInt(char, 10) as Digit;
      grid[i].value = value;
      grid[i].isGiven = true;
      grid[i].candidates = new Set();
    }
  }

  // Calculate initial candidates
  return calculateAllCandidates(grid);
}

/** Get all cell indices in a row */
export function getRowIndices(row: number): number[] {
  const indices: number[] = [];
  for (let col = 0; col < 9; col++) {
    indices.push(toIndex(row, col));
  }
  return indices;
}

/** Get all cell indices in a column */
export function getColIndices(col: number): number[] {
  const indices: number[] = [];
  for (let row = 0; row < 9; row++) {
    indices.push(toIndex(row, col));
  }
  return indices;
}

/** Get all cell indices in a box */
export function getBoxIndices(box: number): number[] {
  const indices: number[] = [];
  const startRow = Math.floor(box / 3) * 3;
  const startCol = (box % 3) * 3;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      indices.push(toIndex(startRow + r, startCol + c));
    }
  }
  return indices;
}

/** Get all units (rows, columns, boxes) */
export function getAllUnits(): Unit[] {
  const units: Unit[] = [];

  // Rows
  for (let i = 0; i < 9; i++) {
    units.push({ type: "row", index: i, cells: getRowIndices(i) });
  }

  // Columns
  for (let i = 0; i < 9; i++) {
    units.push({ type: "col", index: i, cells: getColIndices(i) });
  }

  // Boxes
  for (let i = 0; i < 9; i++) {
    units.push({ type: "box", index: i, cells: getBoxIndices(i) });
  }

  return units;
}

/** Get all peers of a cell (same row, column, or box) */
export function getPeerIndices(row: number, col: number): number[] {
  const peers = new Set<number>();
  const cellIndex = toIndex(row, col);
  const box = getBoxIndex(row, col);

  // Add row peers
  for (const idx of getRowIndices(row)) {
    if (idx !== cellIndex) peers.add(idx);
  }

  // Add column peers
  for (const idx of getColIndices(col)) {
    if (idx !== cellIndex) peers.add(idx);
  }

  // Add box peers
  for (const idx of getBoxIndices(box)) {
    if (idx !== cellIndex) peers.add(idx);
  }

  return Array.from(peers);
}

/** Calculate candidates for a single cell based on its peers */
export function calculateCandidates(
  grid: SudokuGrid,
  row: number,
  col: number,
): Candidates {
  const cell = grid[toIndex(row, col)];

  // If cell has a value, no candidates
  if (cell.value !== null) {
    return new Set();
  }

  const candidates: Candidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const peerIndices = getPeerIndices(row, col);

  // Remove values that appear in peers
  for (const peerIdx of peerIndices) {
    const peerValue = grid[peerIdx].value;
    if (peerValue !== null) {
      candidates.delete(peerValue);
    }
  }

  return candidates;
}

/** Recalculate all candidates in the grid */
export function calculateAllCandidates(grid: SudokuGrid): SudokuGrid {
  const newGrid = cloneGrid(grid);

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const idx = toIndex(row, col);
      newGrid[idx].candidates = calculateCandidates(newGrid, row, col);
    }
  }

  return newGrid;
}

/** Deep clone a grid */
export function cloneGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map((cell) => ({
    ...cell,
    candidates: new Set(cell.candidates),
  }));
}

/** Check if the grid is completely solved */
export function isSolved(grid: SudokuGrid): boolean {
  return grid.every((cell) => cell.value !== null);
}

/** Check if a grid has any cells with no candidates (invalid state) */
export function hasEmptyCandidates(grid: SudokuGrid): boolean {
  return grid.some((cell) => cell.value === null && cell.candidates.size === 0);
}

/** Apply a value placement to the grid */
export function placeValue(
  grid: SudokuGrid,
  row: number,
  col: number,
  value: Digit,
): SudokuGrid {
  const newGrid = cloneGrid(grid);
  const idx = toIndex(row, col);

  newGrid[idx].value = value;
  newGrid[idx].candidates = new Set();

  // Remove this value from all peers' candidates
  for (const peerIdx of getPeerIndices(row, col)) {
    newGrid[peerIdx].candidates.delete(value);
  }

  return newGrid;
}

/** Remove candidates from a cell */
export function eliminateCandidates(
  grid: SudokuGrid,
  row: number,
  col: number,
  toEliminate: number[],
): SudokuGrid {
  const newGrid = cloneGrid(grid);
  const idx = toIndex(row, col);

  for (const candidate of toEliminate) {
    newGrid[idx].candidates.delete(candidate as Digit);
  }

  return newGrid;
}

/** Convert grid to puzzle string */
export function gridToString(grid: SudokuGrid): string {
  return grid.map((cell) => (cell.value ?? 0).toString()).join("");
}

/** Count empty cells in the grid */
export function countEmptyCells(grid: SudokuGrid): number {
  return grid.filter((cell) => cell.value === null).length;
}

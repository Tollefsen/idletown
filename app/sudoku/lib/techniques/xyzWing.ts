// XYZ-Wing - IMPLEMENTED
// Pattern: Variant of XY-Wing where the pivot has 3 candidates:
// - Pivot cell has candidates {X, Y, Z}
// - Wing 1 (sees pivot, in same box or line) has candidates {X, Z}
// - Wing 2 (sees pivot, in same box or line) has candidates {Y, Z}
// Elimination: Remove Z from cells that see ALL THREE cells (pivot + both wings)

import { getPeerIndices, toIndex } from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

interface TriValueCell {
  row: number;
  col: number;
  index: number;
  candidates: Digit[];
}

interface BiValueCell {
  row: number;
  col: number;
  index: number;
  candidates: [Digit, Digit];
}

/**
 * Find all cells with exactly 3 candidates
 */
function findTriValueCells(grid: SudokuGrid): TriValueCell[] {
  const cells: TriValueCell[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const idx = toIndex(row, col);
      const cell = grid[idx];

      if (cell.value === null && cell.candidates.size === 3) {
        const candidates = Array.from(cell.candidates).sort(
          (a, b) => a - b,
        ) as Digit[];
        cells.push({ row, col, index: idx, candidates });
      }
    }
  }

  return cells;
}

/**
 * Find all cells with exactly 2 candidates
 */
function findBiValueCells(grid: SudokuGrid): BiValueCell[] {
  const cells: BiValueCell[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const idx = toIndex(row, col);
      const cell = grid[idx];

      if (cell.value === null && cell.candidates.size === 2) {
        const candidates = Array.from(cell.candidates).sort(
          (a, b) => a - b,
        ) as [Digit, Digit];
        cells.push({ row, col, index: idx, candidates });
      }
    }
  }

  return cells;
}

/**
 * Check if two cells see each other (are peers)
 */
function cellsSeePeers(
  row1: number,
  col1: number,
  row2: number,
  col2: number,
): boolean {
  if (row1 === row2 && col1 === col2) return false;

  // Same row
  if (row1 === row2) return true;

  // Same column
  if (col1 === col2) return true;

  // Same box
  const box1 = Math.floor(row1 / 3) * 3 + Math.floor(col1 / 3);
  const box2 = Math.floor(row2 / 3) * 3 + Math.floor(col2 / 3);
  return box1 === box2;
}

/**
 * Get peers that see all three cells
 */
function getCommonPeersOfThree(
  cell1: { row: number; col: number },
  cell2: { row: number; col: number },
  cell3: { row: number; col: number },
): number[] {
  const peers1 = new Set(getPeerIndices(cell1.row, cell1.col));
  const peers2 = new Set(getPeerIndices(cell2.row, cell2.col));
  const peers3 = getPeerIndices(cell3.row, cell3.col);

  return peers3.filter((idx) => peers1.has(idx) && peers2.has(idx));
}

export const xyzWing: Technique = {
  id: "xyz-wing",
  name: "XYZ-Wing",
  difficulty: "expert",
  implemented: true,
  description:
    "Variant of XY-Wing where the pivot has three candidates. Allows eliminations based on the shared candidate.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    const triValueCells = findTriValueCells(grid);
    const biValueCells = findBiValueCells(grid);

    if (triValueCells.length === 0 || biValueCells.length < 2) return null;

    // For each potential pivot cell with 3 candidates {X, Y, Z}
    for (const pivot of triValueCells) {
      const [x, y, z] = pivot.candidates;

      // Find bi-value cells that see the pivot
      const potentialWings = biValueCells.filter((cell) =>
        cellsSeePeers(pivot.row, pivot.col, cell.row, cell.col),
      );

      // We need wings {X, Z} and {Y, Z}
      // Try all candidate combinations for Z (Z could be any of the 3)
      const zCandidates = [
        { z: z, x: x, y: y },
        { z: x, x: y, y: z },
        { z: y, x: x, y: z },
      ];

      for (const combo of zCandidates) {
        const currentZ = combo.z;
        const currentX = combo.x;
        const currentY = combo.y;

        // Find Wing 1: {X, Z}
        const wing1Candidates = potentialWings.filter(
          (cell) =>
            cell.candidates.includes(currentX) &&
            cell.candidates.includes(currentZ) &&
            !cell.candidates.includes(currentY),
        );

        // Find Wing 2: {Y, Z}
        const wing2Candidates = potentialWings.filter(
          (cell) =>
            cell.candidates.includes(currentY) &&
            cell.candidates.includes(currentZ) &&
            !cell.candidates.includes(currentX),
        );

        for (const wing1 of wing1Candidates) {
          for (const wing2 of wing2Candidates) {
            if (wing1.index === wing2.index) continue;

            // Found XYZ-Wing! Pivot={X,Y,Z}, Wing1={X,Z}, Wing2={Y,Z}
            // Eliminate Z from cells that see ALL THREE cells
            const commonPeers = getCommonPeersOfThree(pivot, wing1, wing2);

            const eliminations: Array<{
              row: number;
              col: number;
              candidates: number[];
            }> = [];

            for (const peerIdx of commonPeers) {
              const cell = grid[peerIdx];

              // Don't eliminate from the pivot or wings themselves
              if (
                peerIdx === pivot.index ||
                peerIdx === wing1.index ||
                peerIdx === wing2.index
              ) {
                continue;
              }

              if (cell.value === null && cell.candidates.has(currentZ)) {
                eliminations.push({
                  row: cell.row,
                  col: cell.col,
                  candidates: [currentZ],
                });
              }
            }

            if (eliminations.length > 0) {
              return {
                techniqueId: "xyz-wing",
                placements: [],
                eliminations,
                description: `XYZ-Wing: Pivot r${pivot.row + 1}c${pivot.col + 1} {${currentX},${currentY},${currentZ}}, Wings r${wing1.row + 1}c${wing1.col + 1} {${currentX},${currentZ}} and r${wing2.row + 1}c${wing2.col + 1} {${currentY},${currentZ}} - eliminate ${currentZ}`,
              };
            }
          }
        }
      }
    }

    return null;
  },
};

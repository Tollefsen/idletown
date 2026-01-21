// XY-Wing - IMPLEMENTED
// Pattern: Three cells with exactly 2 candidates each:
// - Pivot cell has candidates {X, Y}
// - Wing 1 (sees pivot) has candidates {X, Z}
// - Wing 2 (sees pivot) has candidates {Y, Z}
// Elimination: Remove Z from any cell that sees BOTH wings

import { getPeerIndices, toIndex } from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

interface BiValueCell {
  row: number;
  col: number;
  index: number;
  candidates: [Digit, Digit];
}

/**
 * Find all cells with exactly 2 candidates
 */
function findBiValueCells(grid: SudokuGrid): BiValueCell[] {
  const biValueCells: BiValueCell[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const idx = toIndex(row, col);
      const cell = grid[idx];

      if (cell.value === null && cell.candidates.size === 2) {
        const candidates = Array.from(cell.candidates).sort(
          (a, b) => a - b,
        ) as [Digit, Digit];
        biValueCells.push({ row, col, index: idx, candidates });
      }
    }
  }

  return biValueCells;
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
 * Get intersection of two peer sets
 */
function getCommonPeers(
  row1: number,
  col1: number,
  row2: number,
  col2: number,
): number[] {
  const peers1 = new Set(getPeerIndices(row1, col1));
  const peers2 = getPeerIndices(row2, col2);
  return peers2.filter((idx) => peers1.has(idx));
}

export const xyWing: Technique = {
  id: "xy-wing",
  name: "XY-Wing",
  difficulty: "expert",
  implemented: true,
  description:
    "Three cells with two candidates each form a pivot pattern. The wing cells eliminate a common candidate from cells they both see.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    const biValueCells = findBiValueCells(grid);

    if (biValueCells.length < 3) return null;

    // For each potential pivot cell
    for (const pivot of biValueCells) {
      const [x, y] = pivot.candidates;

      // Find potential wing cells that see the pivot
      const potentialWings = biValueCells.filter(
        (cell) =>
          cell.index !== pivot.index &&
          cellsSeePeers(pivot.row, pivot.col, cell.row, cell.col),
      );

      // Find wings: one with {X, Z} and one with {Y, Z}
      for (const wing1 of potentialWings) {
        // Wing 1 must contain X but not Y (so it's {X, Z})
        if (!wing1.candidates.includes(x) || wing1.candidates.includes(y)) {
          continue;
        }

        const z = wing1.candidates.find((c) => c !== x) as Digit;

        // Wing 2 must have {Y, Z}
        for (const wing2 of potentialWings) {
          if (wing2.index === wing1.index) continue;

          const hasY = wing2.candidates.includes(y);
          const hasZ = wing2.candidates.includes(z);
          const onlyYZ = wing2.candidates[0] === y || wing2.candidates[1] === y;

          if (
            hasY &&
            hasZ &&
            onlyYZ &&
            wing2.candidates.length === 2 &&
            !wing2.candidates.includes(x)
          ) {
            // Found XY-Wing! Pivot={X,Y}, Wing1={X,Z}, Wing2={Y,Z}
            // Eliminate Z from cells that see BOTH wings
            const commonPeers = getCommonPeers(
              wing1.row,
              wing1.col,
              wing2.row,
              wing2.col,
            );

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

              if (cell.value === null && cell.candidates.has(z)) {
                eliminations.push({
                  row: cell.row,
                  col: cell.col,
                  candidates: [z],
                });
              }
            }

            if (eliminations.length > 0) {
              return {
                techniqueId: "xy-wing",
                placements: [],
                eliminations,
                description: `XY-Wing: Pivot r${pivot.row + 1}c${pivot.col + 1} {${x},${y}}, Wings r${wing1.row + 1}c${wing1.col + 1} {${x},${z}} and r${wing2.row + 1}c${wing2.col + 1} {${y},${z}} - eliminate ${z}`,
              };
            }
          }
        }
      }
    }

    return null;
  },
};

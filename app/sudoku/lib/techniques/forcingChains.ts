// Forcing Chains - IMPLEMENTED
// For a cell with N candidates, assume each candidate is true one at a time.
// Follow the logical implications of each assumption.
// If ALL assumptions lead to the same conclusion, that conclusion must be true.
//
// Types of conclusions:
// 1. A specific cell must have a specific value (placement)
// 2. A specific candidate must be eliminated from a cell

import {
  cloneGrid,
  getPeerIndices,
  isSolved,
  placeValue,
  toIndex,
} from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

interface Implication {
  cellIndex: number;
  row: number;
  col: number;
  digit: Digit;
  type: "placement" | "elimination";
}

/**
 * Follow implications from placing a digit in a cell
 * Returns all forced placements and eliminations
 */
function followImplications(
  grid: SudokuGrid,
  startCellIndex: number,
  startDigit: Digit,
  maxDepth = 5,
): Implication[] {
  const implications: Implication[] = [];
  let workingGrid = cloneGrid(grid);

  // Place the starting value
  const startCell = workingGrid[startCellIndex];
  workingGrid = placeValue(
    workingGrid,
    startCell.row,
    startCell.col,
    startDigit,
  );

  implications.push({
    cellIndex: startCellIndex,
    row: startCell.row,
    col: startCell.col,
    digit: startDigit,
    type: "placement",
  });

  // Iteratively find forced moves
  let changed = true;
  let depth = 0;

  while (changed && depth < maxDepth && !isSolved(workingGrid)) {
    changed = false;
    depth++;

    for (let idx = 0; idx < 81; idx++) {
      const cell = workingGrid[idx];

      if (cell.value !== null) continue;

      // Naked single: only one candidate left
      if (cell.candidates.size === 1) {
        const digit = Array.from(cell.candidates)[0];
        workingGrid = placeValue(workingGrid, cell.row, cell.col, digit);

        implications.push({
          cellIndex: idx,
          row: cell.row,
          col: cell.col,
          digit,
          type: "placement",
        });

        changed = true;
      }

      // Check for contradictions (no candidates)
      if (cell.candidates.size === 0) {
        // This assumption leads to a contradiction - return empty to signal this
        return [];
      }
    }
  }

  return implications;
}

/**
 * Find cells with 2-3 candidates (best for forcing chains)
 */
function findForcingChainCells(
  grid: SudokuGrid,
): Array<{ index: number; row: number; col: number; candidates: Digit[] }> {
  const cells: Array<{
    index: number;
    row: number;
    col: number;
    candidates: Digit[];
  }> = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const idx = toIndex(row, col);
      const cell = grid[idx];

      if (
        cell.value === null &&
        cell.candidates.size >= 2 &&
        cell.candidates.size <= 3
      ) {
        cells.push({
          index: idx,
          row,
          col,
          candidates: Array.from(cell.candidates) as Digit[],
        });
      }
    }
  }

  // Sort by number of candidates (prefer cells with fewer candidates)
  cells.sort((a, b) => a.candidates.length - b.candidates.length);

  return cells;
}

export const forcingChains: Technique = {
  id: "forcing-chains",
  name: "Forcing Chains",
  difficulty: "master",
  implemented: true,
  description:
    "Following implications from assuming each candidate in a cell, finding common conclusions that must be true.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    const forcingCells = findForcingChainCells(grid);

    for (const forcingCell of forcingCells) {
      const allImplications: Map<string, Implication>[] = [];
      let hasContradiction = false;
      let contradictionDigit: Digit | null = null;

      // Follow implications for each candidate
      for (const candidate of forcingCell.candidates) {
        const implications = followImplications(
          grid,
          forcingCell.index,
          candidate,
        );

        if (implications.length === 0) {
          // This candidate leads to contradiction - it can be eliminated
          hasContradiction = true;
          contradictionDigit = candidate;
          break;
        }

        const implMap = new Map<string, Implication>();
        for (const impl of implications) {
          if (impl.cellIndex !== forcingCell.index) {
            const key = `${impl.cellIndex}-${impl.digit}-${impl.type}`;
            implMap.set(key, impl);
          }
        }
        allImplications.push(implMap);
      }

      // If one candidate leads to contradiction, eliminate it
      if (hasContradiction && contradictionDigit !== null) {
        return {
          techniqueId: "forcing-chains",
          placements: [],
          eliminations: [
            {
              row: forcingCell.row,
              col: forcingCell.col,
              candidates: [contradictionDigit],
            },
          ],
          description: `Forcing Chain: ${contradictionDigit} in r${forcingCell.row + 1}c${forcingCell.col + 1} leads to contradiction - eliminate`,
        };
      }

      // Find common implications across all candidates
      if (allImplications.length === forcingCell.candidates.length) {
        // Find placements that appear in ALL implication sets
        const firstMap = allImplications[0];

        for (const [key, impl] of firstMap) {
          if (impl.type === "placement") {
            // Check if this placement appears in all other maps
            const appearsInAll = allImplications
              .slice(1)
              .every((map) => map.has(key));

            if (appearsInAll) {
              // This placement is forced regardless of which candidate is true
              const targetCell = grid[impl.cellIndex];

              // Make sure it's not already placed
              if (targetCell.value === null) {
                return {
                  techniqueId: "forcing-chains",
                  placements: [
                    {
                      row: impl.row,
                      col: impl.col,
                      value: impl.digit,
                    },
                  ],
                  eliminations: [],
                  description: `Forcing Chain: All candidates in r${forcingCell.row + 1}c${forcingCell.col + 1} lead to ${impl.digit} in r${impl.row + 1}c${impl.col + 1}`,
                };
              }
            }
          }
        }

        // Find cells where a digit is eliminated in ALL branches
        // Group eliminations by cell
        const eliminationsByCell = new Map<number, Map<Digit, number>>();

        for (const implMap of allImplications) {
          for (const [, impl] of implMap) {
            if (impl.type === "placement") {
              // A placement in a cell eliminates all other candidates from that cell
              // AND eliminates this digit from all peers
              const peers = getPeerIndices(impl.row, impl.col);
              for (const peerIdx of peers) {
                const peerCell = grid[peerIdx];
                if (
                  peerCell.value === null &&
                  peerCell.candidates.has(impl.digit)
                ) {
                  if (!eliminationsByCell.has(peerIdx)) {
                    eliminationsByCell.set(peerIdx, new Map());
                  }
                  const cellElims = eliminationsByCell.get(peerIdx);
                  if (cellElims) {
                    cellElims.set(
                      impl.digit,
                      (cellElims.get(impl.digit) || 0) + 1,
                    );
                  }
                }
              }
            }
          }
        }

        // Find eliminations that occur in ALL branches
        for (const [cellIdx, digitCounts] of eliminationsByCell) {
          for (const [digit, count] of digitCounts) {
            if (count === forcingCell.candidates.length) {
              const cell = grid[cellIdx];
              if (cell.candidates.has(digit)) {
                return {
                  techniqueId: "forcing-chains",
                  placements: [],
                  eliminations: [
                    {
                      row: cell.row,
                      col: cell.col,
                      candidates: [digit],
                    },
                  ],
                  description: `Forcing Chain: All candidates in r${forcingCell.row + 1}c${forcingCell.col + 1} eliminate ${digit} from r${cell.row + 1}c${cell.col + 1}`,
                };
              }
            }
          }
        }
      }
    }

    return null;
  },
};

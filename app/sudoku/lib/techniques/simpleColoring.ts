// Simple Coloring - IMPLEMENTED
// A chain-based technique for single candidates:
// 1. Find cells where a digit appears exactly twice in a unit (conjugate pairs)
// 2. Build chains of connected conjugate pairs, alternating colors
// 3. Rule 1: If two cells of same color see each other → that color is FALSE, eliminate from all same-colored cells
// 4. Rule 2: If any cell sees both colors → eliminate the candidate from that cell

import { getAllUnits, getPeerIndices, toIndex } from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

/**
 * Check if two cells see each other (are peers)
 */
function cellsSeeEachOther(idx1: number, idx2: number): boolean {
  if (idx1 === idx2) return false;
  const row1 = Math.floor(idx1 / 9);
  const col1 = idx1 % 9;
  const row2 = Math.floor(idx2 / 9);
  const col2 = idx2 % 9;

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
 * Find all conjugate pairs for a digit (units where the digit appears exactly twice)
 */
function findConjugatePairs(
  grid: SudokuGrid,
  digit: Digit,
): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  const units = getAllUnits();

  for (const unit of units) {
    const cellsWithDigit = unit.cells.filter((idx) => {
      const cell = grid[idx];
      return cell.value === null && cell.candidates.has(digit);
    });

    if (cellsWithDigit.length === 2) {
      pairs.push([cellsWithDigit[0], cellsWithDigit[1]]);
    }
  }

  return pairs;
}

/**
 * Build connected chains of conjugate pairs using alternating colors
 * Returns multiple chains (disconnected components)
 */
function buildColorChains(
  pairs: Array<[number, number]>,
): Map<number, "A" | "B">[] {
  if (pairs.length === 0) return [];

  // Build adjacency map
  const adjacency = new Map<number, Set<number>>();
  for (const [a, b] of pairs) {
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    if (!adjacency.has(b)) adjacency.set(b, new Set());
    adjacency.get(a)?.add(b);
    adjacency.get(b)?.add(a);
  }

  const allCells = new Set(adjacency.keys());
  const visited = new Set<number>();
  const chains: Map<number, "A" | "B">[] = [];

  // BFS to color each connected component
  for (const startCell of allCells) {
    if (visited.has(startCell)) continue;

    const chain = new Map<number, "A" | "B">();
    const queue: Array<{ cell: number; color: "A" | "B" }> = [
      { cell: startCell, color: "A" },
    ];

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) continue;
      const { cell, color } = item;

      if (visited.has(cell)) continue;
      visited.add(cell);
      chain.set(cell, color);

      const neighbors = adjacency.get(cell) || new Set();
      const nextColor: "A" | "B" = color === "A" ? "B" : "A";

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ cell: neighbor, color: nextColor });
        }
      }
    }

    if (chain.size >= 2) {
      chains.push(chain);
    }
  }

  return chains;
}

export const simpleColoring: Technique = {
  id: "simple-coloring",
  name: "Simple Coloring",
  difficulty: "expert",
  implemented: true,
  description:
    "Single-candidate chains where cells are colored alternately. Contradictions or seeing both colors lead to eliminations.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;

      // Find conjugate pairs for this digit
      const pairs = findConjugatePairs(grid, digit);
      if (pairs.length < 2) continue;

      // Build color chains
      const chains = buildColorChains(pairs);

      for (const chain of chains) {
        if (chain.size < 2) continue;

        const colorACells: number[] = [];
        const colorBCells: number[] = [];

        for (const [idx, color] of chain) {
          if (color === "A") colorACells.push(idx);
          else colorBCells.push(idx);
        }

        // Rule 1: Two cells of same color see each other → that color is false
        // Check color A cells
        for (let i = 0; i < colorACells.length; i++) {
          for (let j = i + 1; j < colorACells.length; j++) {
            if (cellsSeeEachOther(colorACells[i], colorACells[j])) {
              // Color A is false - eliminate digit from ALL color A cells
              const eliminations: Array<{
                row: number;
                col: number;
                candidates: number[];
              }> = [];

              for (const idx of colorACells) {
                const cell = grid[idx];
                if (cell.candidates.has(digit)) {
                  eliminations.push({
                    row: cell.row,
                    col: cell.col,
                    candidates: [digit],
                  });
                }
              }

              if (eliminations.length > 0) {
                return {
                  techniqueId: "simple-coloring",
                  placements: [],
                  eliminations,
                  description: `Simple Coloring (Rule 1): Two Color-A cells see each other for ${digit} - eliminate ${digit} from all Color-A cells`,
                };
              }
            }
          }
        }

        // Check color B cells
        for (let i = 0; i < colorBCells.length; i++) {
          for (let j = i + 1; j < colorBCells.length; j++) {
            if (cellsSeeEachOther(colorBCells[i], colorBCells[j])) {
              // Color B is false - eliminate digit from ALL color B cells
              const eliminations: Array<{
                row: number;
                col: number;
                candidates: number[];
              }> = [];

              for (const idx of colorBCells) {
                const cell = grid[idx];
                if (cell.candidates.has(digit)) {
                  eliminations.push({
                    row: cell.row,
                    col: cell.col,
                    candidates: [digit],
                  });
                }
              }

              if (eliminations.length > 0) {
                return {
                  techniqueId: "simple-coloring",
                  placements: [],
                  eliminations,
                  description: `Simple Coloring (Rule 1): Two Color-B cells see each other for ${digit} - eliminate ${digit} from all Color-B cells`,
                };
              }
            }
          }
        }

        // Rule 2: Any non-chain cell that sees BOTH colors → eliminate from that cell
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            const idx = toIndex(row, col);
            const cell = grid[idx];

            // Skip if in chain, already solved, or doesn't have the candidate
            if (chain.has(idx)) continue;
            if (cell.value !== null) continue;
            if (!cell.candidates.has(digit)) continue;

            // Check if this cell sees both colors
            const peers = getPeerIndices(row, col);
            let seesColorA = false;
            let seesColorB = false;

            for (const peerIdx of peers) {
              if (chain.has(peerIdx)) {
                if (chain.get(peerIdx) === "A") seesColorA = true;
                else seesColorB = true;
              }
            }

            if (seesColorA && seesColorB) {
              return {
                techniqueId: "simple-coloring",
                placements: [],
                eliminations: [
                  {
                    row,
                    col,
                    candidates: [digit],
                  },
                ],
                description: `Simple Coloring (Rule 2): r${row + 1}c${col + 1} sees both colors for ${digit} - eliminate ${digit}`,
              };
            }
          }
        }
      }
    }

    return null;
  },
};

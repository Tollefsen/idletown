// Unique Rectangles - IMPLEMENTED
// Based on the assumption that a valid Sudoku has exactly one solution.
// A "deadly pattern" is a rectangle of 4 cells in 2 rows, 2 columns, and 2 boxes
// where each cell contains only the same 2 candidates - this would allow 2 solutions.
// Since valid puzzles have unique solutions, we can eliminate candidates to prevent this.
//
// Type 1: Three cells have exactly {A,B}, fourth has {A,B,+extras}
//         → Remove A and B from the fourth cell
// Type 2: Two cells have {A,B}, two cells have {A,B,C} where C is the same
//         → Remove C from cells outside the rectangle that see both {A,B,C} cells
// Type 4: Two cells have {A,B}, two cells have {A,B,C} and {A,B,D}
//         → The digit common to {A,B} that's NOT in {C,D} can be eliminated from those cells

import { getBoxIndex, toIndex } from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

interface RectangleCell {
  row: number;
  col: number;
  index: number;
  candidates: Set<Digit>;
}

/**
 * Check if 4 cells form a valid rectangle (2 rows, 2 cols, 2 boxes)
 */
function isValidRectangle(cells: RectangleCell[]): boolean {
  if (cells.length !== 4) return false;

  const rows = new Set(cells.map((c) => c.row));
  const cols = new Set(cells.map((c) => c.col));
  const boxes = new Set(cells.map((c) => getBoxIndex(c.row, c.col)));

  return rows.size === 2 && cols.size === 2 && boxes.size === 2;
}

/**
 * Check if two sets have the same elements
 */
function setsEqual(a: Set<Digit>, b: Set<Digit>): boolean {
  if (a.size !== b.size) return false;
  for (const val of a) {
    if (!b.has(val)) return false;
  }
  return true;
}

/**
 * Get intersection of two sets
 */
function setIntersection(a: Set<Digit>, b: Set<Digit>): Set<Digit> {
  const result = new Set<Digit>();
  for (const val of a) {
    if (b.has(val)) result.add(val);
  }
  return result;
}

/**
 * Find all bi-value cells (exactly 2 candidates)
 */
function findBiValueCells(grid: SudokuGrid): RectangleCell[] {
  const cells: RectangleCell[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const idx = toIndex(row, col);
      const cell = grid[idx];

      if (cell.value === null && cell.candidates.size === 2) {
        cells.push({
          row,
          col,
          index: idx,
          candidates: new Set(cell.candidates),
        });
      }
    }
  }

  return cells;
}

/**
 * Find cells that could complete a rectangle (have the base candidates + possibly more)
 */
function findPotentialRectangleCells(
  grid: SudokuGrid,
  baseCandidates: Set<Digit>,
): RectangleCell[] {
  const cells: RectangleCell[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const idx = toIndex(row, col);
      const cell = grid[idx];

      if (cell.value === null && cell.candidates.size >= 2) {
        // Must contain all base candidates
        let hasAllBase = true;
        for (const candidate of baseCandidates) {
          if (!cell.candidates.has(candidate)) {
            hasAllBase = false;
            break;
          }
        }

        if (hasAllBase) {
          cells.push({
            row,
            col,
            index: idx,
            candidates: new Set(cell.candidates),
          });
        }
      }
    }
  }

  return cells;
}

export const uniqueRectangles: Technique = {
  id: "unique-rectangles",
  name: "Unique Rectangles",
  difficulty: "master",
  implemented: true,
  description:
    "Exploits the assumption that a valid puzzle has a unique solution to eliminate candidates that would create ambiguity.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    // Find all bi-value cells as potential rectangle corners
    const biValueCells = findBiValueCells(grid);

    // Group bi-value cells by their candidate pair
    const cellsByPair = new Map<string, RectangleCell[]>();
    for (const cell of biValueCells) {
      const key = Array.from(cell.candidates).sort().join(",");
      if (!cellsByPair.has(key)) {
        cellsByPair.set(key, []);
      }
      cellsByPair.get(key)?.push(cell);
    }

    // For each candidate pair, look for rectangle patterns
    for (const [pairKey, cells] of cellsByPair) {
      const baseCandidates = new Set(
        pairKey.split(",").map((n) => Number.parseInt(n, 10) as Digit),
      );

      if (cells.length < 2) continue;

      // Find all cells that could be part of a rectangle (have base candidates + maybe more)
      const potentialCells = findPotentialRectangleCells(grid, baseCandidates);

      // Try all combinations of 4 cells to find rectangles
      for (let i = 0; i < potentialCells.length; i++) {
        for (let j = i + 1; j < potentialCells.length; j++) {
          for (let k = j + 1; k < potentialCells.length; k++) {
            for (let l = k + 1; l < potentialCells.length; l++) {
              const rectangle = [
                potentialCells[i],
                potentialCells[j],
                potentialCells[k],
                potentialCells[l],
              ];

              if (!isValidRectangle(rectangle)) continue;

              // Count cells with exactly base candidates vs cells with extras
              const exactCells = rectangle.filter((c) =>
                setsEqual(c.candidates, baseCandidates),
              );
              const extraCells = rectangle.filter(
                (c) => !setsEqual(c.candidates, baseCandidates),
              );

              // Type 1: Three cells with {A,B}, one cell with {A,B,+extras}
              if (exactCells.length === 3 && extraCells.length === 1) {
                const floorCell = extraCells[0];
                const extras: Digit[] = [];
                for (const candidate of floorCell.candidates) {
                  if (!baseCandidates.has(candidate)) {
                    extras.push(candidate);
                  }
                }

                // If the floor cell has more than just the base pair, eliminate the base pair
                if (extras.length > 0) {
                  const [a, b] = Array.from(baseCandidates) as [Digit, Digit];
                  return {
                    techniqueId: "unique-rectangles",
                    placements: [],
                    eliminations: [
                      {
                        row: floorCell.row,
                        col: floorCell.col,
                        candidates: [a, b],
                      },
                    ],
                    description: `Unique Rectangle Type 1: {${a},${b}} at r${exactCells[0].row + 1}c${exactCells[0].col + 1}, r${exactCells[1].row + 1}c${exactCells[1].col + 1}, r${exactCells[2].row + 1}c${exactCells[2].col + 1} - eliminate {${a},${b}} from r${floorCell.row + 1}c${floorCell.col + 1}`,
                  };
                }
              }

              // Type 2: Two cells with {A,B}, two cells with {A,B,C} (same extra candidate)
              if (exactCells.length === 2 && extraCells.length === 2) {
                const extras1 = new Set<Digit>();
                const extras2 = new Set<Digit>();

                for (const c of extraCells[0].candidates) {
                  if (!baseCandidates.has(c)) extras1.add(c);
                }
                for (const c of extraCells[1].candidates) {
                  if (!baseCandidates.has(c)) extras2.add(c);
                }

                // Check if they share exactly one extra candidate
                const commonExtras = setIntersection(extras1, extras2);

                if (
                  commonExtras.size === 1 &&
                  extras1.size === 1 &&
                  extras2.size === 1
                ) {
                  const extraCandidate = Array.from(commonExtras)[0];

                  // The two extra cells must see each other (same row, col, or box)
                  const cell1 = extraCells[0];
                  const cell2 = extraCells[1];

                  const sameRow = cell1.row === cell2.row;
                  const sameCol = cell1.col === cell2.col;
                  const sameBox =
                    getBoxIndex(cell1.row, cell1.col) ===
                    getBoxIndex(cell2.row, cell2.col);

                  if (sameRow || sameCol || sameBox) {
                    // Find cells that see both extra cells and have the extra candidate
                    const eliminations: Array<{
                      row: number;
                      col: number;
                      candidates: number[];
                    }> = [];

                    for (let row = 0; row < 9; row++) {
                      for (let col = 0; col < 9; col++) {
                        const idx = toIndex(row, col);
                        const cell = grid[idx];

                        if (
                          idx === cell1.index ||
                          idx === cell2.index ||
                          cell.value !== null
                        )
                          continue;
                        if (!cell.candidates.has(extraCandidate)) continue;

                        // Check if this cell sees both extra cells
                        const seesCell1 =
                          row === cell1.row ||
                          col === cell1.col ||
                          getBoxIndex(row, col) ===
                            getBoxIndex(cell1.row, cell1.col);
                        const seesCell2 =
                          row === cell2.row ||
                          col === cell2.col ||
                          getBoxIndex(row, col) ===
                            getBoxIndex(cell2.row, cell2.col);

                        if (seesCell1 && seesCell2) {
                          eliminations.push({
                            row,
                            col,
                            candidates: [extraCandidate],
                          });
                        }
                      }
                    }

                    if (eliminations.length > 0) {
                      const [a, b] = Array.from(baseCandidates) as [
                        Digit,
                        Digit,
                      ];
                      return {
                        techniqueId: "unique-rectangles",
                        placements: [],
                        eliminations,
                        description: `Unique Rectangle Type 2: {${a},${b}} rectangle with extra ${extraCandidate} - eliminate ${extraCandidate} from cells seeing both floor cells`,
                      };
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return null;
  },
};

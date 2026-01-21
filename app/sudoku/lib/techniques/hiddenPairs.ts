// Hidden Pairs - IMPLEMENTED
// When two candidates appear only in two cells of a unit,
// all other candidates can be eliminated from those two cells.

import { getAllUnits } from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

export const hiddenPairs: Technique = {
  id: "hidden-pairs",
  name: "Hidden Pairs",
  difficulty: "medium",
  implemented: true,
  description:
    "Two candidates appear only in two cells of a unit. Other candidates can be eliminated from those cells.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    const units = getAllUnits();

    for (const unit of units) {
      // For each digit, find which cells contain it as a candidate
      const digitPositions: Map<Digit, number[]> = new Map();

      for (let d = 1; d <= 9; d++) {
        const digit = d as Digit;
        const positions: number[] = [];

        for (const cellIdx of unit.cells) {
          const cell = grid[cellIdx];
          if (cell.value === null && cell.candidates.has(digit)) {
            positions.push(cellIdx);
          }
        }

        if (positions.length === 2) {
          digitPositions.set(digit, positions);
        }
      }

      // Find pairs of digits that share the same two cells
      const digitsWithTwoPositions = Array.from(digitPositions.keys());

      for (let i = 0; i < digitsWithTwoPositions.length; i++) {
        for (let j = i + 1; j < digitsWithTwoPositions.length; j++) {
          const digit1 = digitsWithTwoPositions[i];
          const digit2 = digitsWithTwoPositions[j];

          const pos1 = digitPositions.get(digit1);
          const pos2 = digitPositions.get(digit2);

          // Safety check (should always exist since we're iterating keys)
          if (!pos1 || !pos2) continue;

          // Check if they share the same two cells
          if (pos1[0] === pos2[0] && pos1[1] === pos2[1]) {
            // Found a hidden pair! Check if we can eliminate other candidates
            const cell1 = grid[pos1[0]];
            const cell2 = grid[pos1[1]];

            const eliminations: Array<{
              row: number;
              col: number;
              candidates: number[];
            }> = [];

            // Check first cell - eliminate all candidates except the pair
            const toEliminate1: number[] = [];
            for (const cand of cell1.candidates) {
              if (cand !== digit1 && cand !== digit2) {
                toEliminate1.push(cand);
              }
            }
            if (toEliminate1.length > 0) {
              eliminations.push({
                row: cell1.row,
                col: cell1.col,
                candidates: toEliminate1,
              });
            }

            // Check second cell
            const toEliminate2: number[] = [];
            for (const cand of cell2.candidates) {
              if (cand !== digit1 && cand !== digit2) {
                toEliminate2.push(cand);
              }
            }
            if (toEliminate2.length > 0) {
              eliminations.push({
                row: cell2.row,
                col: cell2.col,
                candidates: toEliminate2,
              });
            }

            // Only return if we can actually eliminate something
            if (eliminations.length > 0) {
              const unitName =
                unit.type === "row"
                  ? `Row ${unit.index + 1}`
                  : unit.type === "col"
                    ? `Column ${unit.index + 1}`
                    : `Box ${unit.index + 1}`;

              return {
                techniqueId: "hidden-pairs",
                placements: [],
                eliminations,
                description: `Hidden Pair {${digit1},${digit2}} in R${cell1.row + 1}C${cell1.col + 1} and R${cell2.row + 1}C${cell2.col + 1} in ${unitName}`,
              };
            }
          }
        }
      }
    }

    return null;
  },
};

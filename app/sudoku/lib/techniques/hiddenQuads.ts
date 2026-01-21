// Hidden Quads - IMPLEMENTED
// When four candidates appear only in four cells of a unit,
// all other candidates can be eliminated from those four cells.

import { getAllUnits } from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

export const hiddenQuads: Technique = {
  id: "hidden-quads",
  name: "Hidden Quads",
  difficulty: "hard",
  implemented: true,
  description:
    "Four candidates appear only in four cells of a unit. Other candidates can be eliminated from those cells.",

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

        // Only consider digits that appear in 2, 3, or 4 cells
        if (positions.length >= 2 && positions.length <= 4) {
          digitPositions.set(digit, positions);
        }
      }

      // Need at least 4 digits to form a hidden quad
      const eligibleDigits = Array.from(digitPositions.keys());
      if (eligibleDigits.length < 4) continue;

      // Check all combinations of 4 digits
      for (let i = 0; i < eligibleDigits.length; i++) {
        for (let j = i + 1; j < eligibleDigits.length; j++) {
          for (let k = j + 1; k < eligibleDigits.length; k++) {
            for (let l = k + 1; l < eligibleDigits.length; l++) {
              const digit1 = eligibleDigits[i];
              const digit2 = eligibleDigits[j];
              const digit3 = eligibleDigits[k];
              const digit4 = eligibleDigits[l];

              const pos1 = digitPositions.get(digit1);
              const pos2 = digitPositions.get(digit2);
              const pos3 = digitPositions.get(digit3);
              const pos4 = digitPositions.get(digit4);

              if (!pos1 || !pos2 || !pos3 || !pos4) continue;

              // Combine all positions
              const allPositions = new Set<number>();
              for (const p of pos1) allPositions.add(p);
              for (const p of pos2) allPositions.add(p);
              for (const p of pos3) allPositions.add(p);
              for (const p of pos4) allPositions.add(p);

              // If exactly 4 cells contain these 4 digits, we have a hidden quad
              if (allPositions.size === 4) {
                const quadCells = Array.from(allPositions);
                const quadDigits = [digit1, digit2, digit3, digit4];

                // Find eliminations - remove other candidates from the quad cells
                const eliminations: Array<{
                  row: number;
                  col: number;
                  candidates: number[];
                }> = [];

                for (const cellIdx of quadCells) {
                  const cell = grid[cellIdx];
                  const toEliminate: number[] = [];

                  for (const cand of cell.candidates) {
                    if (!quadDigits.includes(cand)) {
                      toEliminate.push(cand);
                    }
                  }

                  if (toEliminate.length > 0) {
                    eliminations.push({
                      row: cell.row,
                      col: cell.col,
                      candidates: toEliminate,
                    });
                  }
                }

                // Only return if we can actually eliminate something
                if (eliminations.length > 0) {
                  const unitName =
                    unit.type === "row"
                      ? `Row ${unit.index + 1}`
                      : unit.type === "col"
                        ? `Column ${unit.index + 1}`
                        : `Box ${unit.index + 1}`;

                  const cellDescriptions = quadCells
                    .map((idx) => `R${grid[idx].row + 1}C${grid[idx].col + 1}`)
                    .join(", ");

                  return {
                    techniqueId: "hidden-quads",
                    placements: [],
                    eliminations,
                    description: `Hidden Quad {${quadDigits.join(",")}} in ${cellDescriptions} in ${unitName}`,
                  };
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

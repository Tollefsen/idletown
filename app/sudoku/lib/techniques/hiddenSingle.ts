// Hidden Singles - IMPLEMENTED
// When a candidate appears in only one cell within a unit (row/col/box)

import { getAllUnits } from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

export const hiddenSingle: Technique = {
  id: "hidden-single",
  name: "Hidden Single",
  difficulty: "easy",
  implemented: true,
  description:
    "A candidate appears in only one cell within a row, column, or box.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    const units = getAllUnits();

    for (const unit of units) {
      // For each digit 1-9
      for (let digit = 1; digit <= 9; digit++) {
        const d = digit as Digit;

        // Find cells in this unit that have this digit as a candidate
        const cellsWithDigit: number[] = [];

        for (const cellIdx of unit.cells) {
          const cell = grid[cellIdx];
          if (cell.value === null && cell.candidates.has(d)) {
            cellsWithDigit.push(cellIdx);
          }
        }

        // If exactly one cell has this candidate, it must go there
        if (cellsWithDigit.length === 1) {
          const cellIdx = cellsWithDigit[0];
          const cell = grid[cellIdx];

          // Only report if this cell has multiple candidates
          // (otherwise naked single would find it)
          if (cell.candidates.size > 1) {
            const unitName =
              unit.type === "row"
                ? `Row ${unit.index + 1}`
                : unit.type === "col"
                  ? `Column ${unit.index + 1}`
                  : `Box ${unit.index + 1}`;

            return {
              techniqueId: "hidden-single",
              placements: [{ row: cell.row, col: cell.col, value: d }],
              eliminations: [],
              description: `${d} can only go in R${cell.row + 1}C${cell.col + 1} within ${unitName}`,
            };
          }
        }
      }
    }

    return null;
  },
};

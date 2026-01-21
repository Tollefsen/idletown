// Naked Singles - IMPLEMENTED
// When a cell has only one candidate remaining, that must be its value

import { toIndex } from "../candidates";
import type { SudokuGrid, Technique, TechniqueResult } from "../types";

export const nakedSingle: Technique = {
  id: "naked-single",
  name: "Naked Single",
  difficulty: "easy",
  implemented: true,
  description:
    "A cell has only one possible candidate remaining, so that must be its value.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = grid[toIndex(row, col)];

        // Skip cells that already have values
        if (cell.value !== null) continue;

        // Check if cell has exactly one candidate
        if (cell.candidates.size === 1) {
          const value = Array.from(cell.candidates)[0];

          return {
            techniqueId: "naked-single",
            placements: [{ row, col, value }],
            eliminations: [],
            description: `Cell R${row + 1}C${col + 1} has only one candidate: ${value}`,
          };
        }
      }
    }

    return null;
  },
};

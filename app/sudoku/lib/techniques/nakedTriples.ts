// Naked Triples - IMPLEMENTED
// When three cells in a unit contain (in total) only three candidates,
// those candidates can be eliminated from all other cells in that unit.
// The cells don't need to each have all three - combinations like {12}{23}{13} work.

import { getAllUnits } from "../candidates";
import type { SudokuGrid, Technique, TechniqueResult } from "../types";

export const nakedTriples: Technique = {
  id: "naked-triples",
  name: "Naked Triples",
  difficulty: "hard",
  implemented: true,
  description:
    "Three cells in a unit contain only three candidates between them. These candidates can be eliminated from other cells.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    const units = getAllUnits();

    for (const unit of units) {
      // Find cells with 2 or 3 candidates (cells with 1 would be naked singles)
      const eligibleCells: number[] = [];

      for (const cellIdx of unit.cells) {
        const cell = grid[cellIdx];
        if (
          cell.value === null &&
          cell.candidates.size >= 2 &&
          cell.candidates.size <= 3
        ) {
          eligibleCells.push(cellIdx);
        }
      }

      // Need at least 3 cells to form a triple
      if (eligibleCells.length < 3) continue;

      // Check all combinations of 3 cells
      for (let i = 0; i < eligibleCells.length; i++) {
        for (let j = i + 1; j < eligibleCells.length; j++) {
          for (let k = j + 1; k < eligibleCells.length; k++) {
            const cell1 = grid[eligibleCells[i]];
            const cell2 = grid[eligibleCells[j]];
            const cell3 = grid[eligibleCells[k]];

            // Combine all candidates from the three cells
            const combined = new Set<number>();
            for (const c of cell1.candidates) combined.add(c);
            for (const c of cell2.candidates) combined.add(c);
            for (const c of cell3.candidates) combined.add(c);

            // If combined has exactly 3 candidates, we have a naked triple
            if (combined.size === 3) {
              const tripleValues = Array.from(combined).sort();

              // Find eliminations in other cells of the unit
              const eliminations: Array<{
                row: number;
                col: number;
                candidates: number[];
              }> = [];

              for (const cellIdx of unit.cells) {
                // Skip the triple cells
                if (
                  cellIdx === eligibleCells[i] ||
                  cellIdx === eligibleCells[j] ||
                  cellIdx === eligibleCells[k]
                ) {
                  continue;
                }

                const cell = grid[cellIdx];
                if (cell.value !== null) continue;

                // Check if this cell has any of the triple's candidates
                const toEliminate: number[] = [];
                for (const cand of tripleValues) {
                  if (
                    cell.candidates.has(
                      cand as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
                    )
                  ) {
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

                return {
                  techniqueId: "naked-triples",
                  placements: [],
                  eliminations,
                  description: `Naked Triple {${tripleValues.join(",")}} in R${cell1.row + 1}C${cell1.col + 1}, R${cell2.row + 1}C${cell2.col + 1}, R${cell3.row + 1}C${cell3.col + 1} in ${unitName}`,
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

// Naked Quads - IMPLEMENTED
// When four cells in a unit contain (in total) only four candidates,
// those candidates can be eliminated from all other cells in that unit.

import { getAllUnits } from "../candidates";
import type { SudokuGrid, Technique, TechniqueResult } from "../types";

export const nakedQuads: Technique = {
  id: "naked-quads",
  name: "Naked Quads",
  difficulty: "hard",
  implemented: true,
  description:
    "Four cells in a unit contain only four candidates between them. These candidates can be eliminated from other cells.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    const units = getAllUnits();

    for (const unit of units) {
      // Find cells with 2, 3, or 4 candidates
      const eligibleCells: number[] = [];

      for (const cellIdx of unit.cells) {
        const cell = grid[cellIdx];
        if (
          cell.value === null &&
          cell.candidates.size >= 2 &&
          cell.candidates.size <= 4
        ) {
          eligibleCells.push(cellIdx);
        }
      }

      // Need at least 4 cells to form a quad
      if (eligibleCells.length < 4) continue;

      // Check all combinations of 4 cells
      for (let i = 0; i < eligibleCells.length; i++) {
        for (let j = i + 1; j < eligibleCells.length; j++) {
          for (let k = j + 1; k < eligibleCells.length; k++) {
            for (let l = k + 1; l < eligibleCells.length; l++) {
              const cell1 = grid[eligibleCells[i]];
              const cell2 = grid[eligibleCells[j]];
              const cell3 = grid[eligibleCells[k]];
              const cell4 = grid[eligibleCells[l]];

              // Combine all candidates from the four cells
              const combined = new Set<number>();
              for (const c of cell1.candidates) combined.add(c);
              for (const c of cell2.candidates) combined.add(c);
              for (const c of cell3.candidates) combined.add(c);
              for (const c of cell4.candidates) combined.add(c);

              // If combined has exactly 4 candidates, we have a naked quad
              if (combined.size === 4) {
                const quadValues = Array.from(combined).sort();

                // Find eliminations in other cells of the unit
                const eliminations: Array<{
                  row: number;
                  col: number;
                  candidates: number[];
                }> = [];

                for (const cellIdx of unit.cells) {
                  // Skip the quad cells
                  if (
                    cellIdx === eligibleCells[i] ||
                    cellIdx === eligibleCells[j] ||
                    cellIdx === eligibleCells[k] ||
                    cellIdx === eligibleCells[l]
                  ) {
                    continue;
                  }

                  const cell = grid[cellIdx];
                  if (cell.value !== null) continue;

                  // Check if this cell has any of the quad's candidates
                  const toEliminate: number[] = [];
                  for (const cand of quadValues) {
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
                    techniqueId: "naked-quads",
                    placements: [],
                    eliminations,
                    description: `Naked Quad {${quadValues.join(",")}} in R${cell1.row + 1}C${cell1.col + 1}, R${cell2.row + 1}C${cell2.col + 1}, R${cell3.row + 1}C${cell3.col + 1}, R${cell4.row + 1}C${cell4.col + 1} in ${unitName}`,
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

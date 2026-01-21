// Naked Pairs - IMPLEMENTED
// When two cells in a unit contain exactly the same two candidates,
// those candidates can be eliminated from all other cells in that unit.

import { getAllUnits } from "../candidates";
import type { SudokuGrid, Technique, TechniqueResult } from "../types";

export const nakedPairs: Technique = {
  id: "naked-pairs",
  name: "Naked Pairs",
  difficulty: "medium",
  implemented: true,
  description:
    "Two cells in a unit contain the same two candidates. These candidates can be eliminated from other cells in that unit.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    const units = getAllUnits();

    for (const unit of units) {
      // Find cells with exactly 2 candidates
      const cellsWithTwoCandidates: number[] = [];

      for (const cellIdx of unit.cells) {
        const cell = grid[cellIdx];
        if (cell.value === null && cell.candidates.size === 2) {
          cellsWithTwoCandidates.push(cellIdx);
        }
      }

      // Need at least 2 cells to form a pair
      if (cellsWithTwoCandidates.length < 2) continue;

      // Check all pairs of cells with 2 candidates
      for (let i = 0; i < cellsWithTwoCandidates.length; i++) {
        for (let j = i + 1; j < cellsWithTwoCandidates.length; j++) {
          const cell1 = grid[cellsWithTwoCandidates[i]];
          const cell2 = grid[cellsWithTwoCandidates[j]];

          // Check if they have the same candidates
          const cands1 = Array.from(cell1.candidates).sort();
          const cands2 = Array.from(cell2.candidates).sort();

          if (cands1[0] === cands2[0] && cands1[1] === cands2[1]) {
            // Found a naked pair! Now check if we can eliminate from other cells
            const eliminations: Array<{
              row: number;
              col: number;
              candidates: number[];
            }> = [];

            for (const cellIdx of unit.cells) {
              // Skip the pair cells themselves
              if (
                cellIdx === cellsWithTwoCandidates[i] ||
                cellIdx === cellsWithTwoCandidates[j]
              ) {
                continue;
              }

              const cell = grid[cellIdx];
              if (cell.value !== null) continue;

              // Check if this cell has any of the pair's candidates
              const toEliminate: number[] = [];
              for (const cand of cands1) {
                if (cell.candidates.has(cand)) {
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
                techniqueId: "naked-pairs",
                placements: [],
                eliminations,
                description: `Naked Pair {${cands1.join(",")}} in R${cell1.row + 1}C${cell1.col + 1} and R${cell2.row + 1}C${cell2.col + 1} in ${unitName}`,
              };
            }
          }
        }
      }
    }

    return null;
  },
};

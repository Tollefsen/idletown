// Sudoku Solver - Applies techniques and tracks usage

import {
  calculateAllCandidates,
  cloneGrid,
  eliminateCandidates,
  hasEmptyCandidates,
  isSolved,
  placeValue,
} from "./candidates";
import { ALL_TECHNIQUES } from "./techniques";
import { maxDifficulty } from "./techniques/base";
import type {
  AnalysisResult,
  Difficulty,
  Digit,
  SudokuGrid,
  TechniqueResult,
  TechniqueUsage,
} from "./types";

const MAX_ITERATIONS = 1000; // Prevent infinite loops

/**
 * Apply a technique result to the grid
 */
function applyResult(grid: SudokuGrid, result: TechniqueResult): SudokuGrid {
  let newGrid = cloneGrid(grid);

  // Apply placements
  for (const placement of result.placements) {
    if (placement.value !== null) {
      newGrid = placeValue(
        newGrid,
        placement.row,
        placement.col,
        placement.value as Digit,
      );
    }
  }

  // Apply eliminations
  for (const elimination of result.eliminations) {
    newGrid = eliminateCandidates(
      newGrid,
      elimination.row,
      elimination.col,
      elimination.candidates,
    );
  }

  return newGrid;
}

/**
 * Analyze a sudoku puzzle and determine its difficulty
 */
export function analyzePuzzle(grid: SudokuGrid): AnalysisResult {
  let currentGrid = calculateAllCandidates(cloneGrid(grid));
  const usageCounts = new Map<string, number>();
  const cellDifficulty = new Map<number, Difficulty>();
  let hardestDifficulty: Difficulty = "easy";
  let hardestTechnique: string | null = null;
  let totalSteps = 0;
  let requiresUnimplemented = false;

  // High water mark: tracks the hardest technique used since last placement
  // This ensures cells are attributed to the technique that "enabled" them
  let currentSolveDifficulty: Difficulty = "easy";

  // Initialize usage counts
  for (const technique of ALL_TECHNIQUES) {
    usageCounts.set(technique.id, 0);
  }

  // Solve loop
  let iterations = 0;
  while (!isSolved(currentGrid) && iterations < MAX_ITERATIONS) {
    iterations++;
    let madeProgress = false;

    // Try each technique in order
    for (const technique of ALL_TECHNIQUES) {
      // Skip unimplemented techniques
      if (!technique.implemented) {
        continue;
      }

      const result = technique.apply(currentGrid);

      if (result !== null) {
        // Update the high water mark for current solve difficulty
        currentSolveDifficulty = maxDifficulty(
          currentSolveDifficulty,
          technique.difficulty,
        );

        // Track which cells were placed and attribute to current solve difficulty
        for (const placement of result.placements) {
          if (placement.value !== null) {
            const cellIndex = placement.row * 9 + placement.col;
            cellDifficulty.set(cellIndex, currentSolveDifficulty);
          }
        }

        // Reset high water mark after a placement (new "chain" starts)
        if (result.placements.length > 0) {
          currentSolveDifficulty = "easy";
        }

        // Apply the result
        currentGrid = applyResult(currentGrid, result);
        totalSteps++;

        // Track usage
        const currentCount = usageCounts.get(technique.id) || 0;
        usageCounts.set(technique.id, currentCount + 1);

        // Track overall puzzle difficulty
        hardestDifficulty = maxDifficulty(
          hardestDifficulty,
          technique.difficulty,
        );
        hardestTechnique = technique.id;

        madeProgress = true;
        break; // Restart from easiest technique
      }
    }

    // Check for invalid state
    if (hasEmptyCandidates(currentGrid)) {
      break;
    }

    // If no progress was made, we're stuck
    if (!madeProgress) {
      // Check if any unimplemented technique might help
      for (const technique of ALL_TECHNIQUES) {
        if (!technique.implemented) {
          requiresUnimplemented = true;
          break;
        }
      }
      break;
    }
  }

  // Build technique usage array
  const techniqueUsage: TechniqueUsage[] = ALL_TECHNIQUES.map((technique) => ({
    techniqueId: technique.id,
    techniqueName: technique.name,
    difficulty: technique.difficulty,
    count: usageCounts.get(technique.id) || 0,
    implemented: technique.implemented,
  }));

  const solved = isSolved(currentGrid);

  return {
    solved,
    grid: currentGrid,
    difficulty: solved ? hardestDifficulty : "unsolvable",
    techniqueUsage,
    hardestTechnique,
    requiresUnimplemented,
    totalSteps,
    cellDifficulty,
  };
}

/**
 * Quick check if a grid is valid (no duplicate values in any unit)
 */
export function isValidGrid(grid: SudokuGrid): boolean {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set<number>();
    for (let col = 0; col < 9; col++) {
      const value = grid[row * 9 + col].value;
      if (value !== null) {
        if (seen.has(value)) return false;
        seen.add(value);
      }
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set<number>();
    for (let row = 0; row < 9; row++) {
      const value = grid[row * 9 + col].value;
      if (value !== null) {
        if (seen.has(value)) return false;
        seen.add(value);
      }
    }
  }

  // Check boxes
  for (let box = 0; box < 9; box++) {
    const seen = new Set<number>();
    const startRow = Math.floor(box / 3) * 3;
    const startCol = (box % 3) * 3;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const value = grid[(startRow + r) * 9 + (startCol + c)].value;
        if (value !== null) {
          if (seen.has(value)) return false;
          seen.add(value);
        }
      }
    }
  }

  return true;
}

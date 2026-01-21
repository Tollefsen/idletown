/**
 * Sudoku Puzzle Generator
 *
 * Generates ~10,000 puzzles and categorizes them by difficulty using
 * our solver. Outputs to app/sudoku/lib/puzzles.ts
 *
 * Run with: pnpm sudoku:generate
 *
 * WARNING: This script takes 10-30 minutes to run. Do not run from an agent.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// Import our solver
import { parseGrid } from "../lib/candidates";
import { analyzePuzzle } from "../lib/solver";
import type { Difficulty } from "../lib/types";

// ============================================================================
// Configuration
// ============================================================================

const TARGET_PUZZLES = 10000;
const BATCH_SIZE = 100;
const MIN_CLUES = 17;

// ============================================================================
// Types
// ============================================================================

type DifficultyOrUnsolvable = Difficulty | "unsolvable";

interface GenerationStats {
  easy: number;
  medium: number;
  hard: number;
  expert: number;
  master: number;
  unsolvable: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

const startTime = Date.now();

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function log(message: string): void {
  const elapsed = formatTime(Date.now() - startTime);
  console.log(`[${elapsed}] ${message}`);
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================================================
// Sudoku Grid Generation (Backtracking)
// ============================================================================

/**
 * Check if placing a digit at (row, col) is valid
 */
function isValidPlacement(
  grid: number[],
  row: number,
  col: number,
  digit: number,
): boolean {
  const index = row * 9 + col;

  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row * 9 + c] === digit) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r * 9 + col] === digit) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      const idx = r * 9 + c;
      if (idx !== index && grid[idx] === digit) return false;
    }
  }

  return true;
}

/**
 * Generate a complete valid Sudoku grid using backtracking
 */
function generateSolvedGrid(): number[] {
  const grid = new Array(81).fill(0);

  function fill(index: number): boolean {
    if (index === 81) return true;

    const row = Math.floor(index / 9);
    const col = index % 9;
    const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const digit of digits) {
      if (isValidPlacement(grid, row, col, digit)) {
        grid[index] = digit;
        if (fill(index + 1)) return true;
        grid[index] = 0;
      }
    }

    return false;
  }

  fill(0);
  return grid;
}

// ============================================================================
// Solution Counting (for uniqueness check)
// ============================================================================

/**
 * Count solutions up to a limit (for uniqueness checking)
 * Returns as soon as we find more than 1 solution
 */
function countSolutions(grid: number[], limit = 2): number {
  // Find first empty cell
  let emptyIndex = -1;
  for (let i = 0; i < 81; i++) {
    if (grid[i] === 0) {
      emptyIndex = i;
      break;
    }
  }

  // No empty cells = solved
  if (emptyIndex === -1) return 1;

  const row = Math.floor(emptyIndex / 9);
  const col = emptyIndex % 9;
  let count = 0;

  for (let digit = 1; digit <= 9; digit++) {
    if (isValidPlacement(grid, row, col, digit)) {
      grid[emptyIndex] = digit;
      count += countSolutions(grid, limit - count);
      grid[emptyIndex] = 0;

      if (count >= limit) return count; // Early exit
    }
  }

  return count;
}

/**
 * Check if a puzzle has exactly one solution
 */
function hasUniqueSolution(grid: number[]): boolean {
  return countSolutions([...grid], 2) === 1;
}

// ============================================================================
// Puzzle Generation
// ============================================================================

/**
 * Generate a puzzle by removing clues from a solved grid
 */
function generatePuzzle(): string {
  const solved = generateSolvedGrid();
  const puzzle = [...solved];

  // Try to remove each cell in random order
  const indices = shuffle([...Array(81).keys()]);
  let clueCount = 81;

  for (const index of indices) {
    if (clueCount <= MIN_CLUES) break;

    const backup = puzzle[index];
    puzzle[index] = 0;

    if (hasUniqueSolution(puzzle)) {
      clueCount--;
    } else {
      puzzle[index] = backup; // Restore
    }
  }

  return puzzle.map((d) => d.toString()).join("");
}

// ============================================================================
// Difficulty Classification
// ============================================================================

/**
 * Categorize a puzzle using our solver
 */
function categorizePuzzle(puzzleString: string): DifficultyOrUnsolvable {
  const grid = parseGrid(puzzleString);
  const result = analyzePuzzle(grid);

  if (!result.solved) {
    return "unsolvable";
  }

  return result.difficulty as Difficulty;
}

// ============================================================================
// Main Generation Loop
// ============================================================================

async function main(): Promise<void> {
  log("Starting puzzle generation...");
  log(`Target: ${TARGET_PUZZLES} puzzles`);
  log("Press Ctrl+C to stop early and save progress.");
  log("");

  // Graceful shutdown handler
  let shouldExit = false;

  process.on("SIGINT", () => {
    if (shouldExit) {
      // Second Ctrl+C - force exit without saving
      log("\nForce exit - progress not saved.");
      process.exit(1);
    }
    log("\nReceived Ctrl+C - finishing current batch and saving...");
    shouldExit = true;
  });

  const puzzlesByDifficulty: Record<DifficultyOrUnsolvable, string[]> = {
    easy: [],
    medium: [],
    hard: [],
    expert: [],
    master: [],
    unsolvable: [],
  };

  const stats: GenerationStats = {
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
    master: 0,
    unsolvable: 0,
  };

  let generated = 0;

  while (generated < TARGET_PUZZLES && !shouldExit) {
    // Generate a batch
    for (let i = 0; i < BATCH_SIZE && generated < TARGET_PUZZLES; i++) {
      const puzzle = generatePuzzle();
      const difficulty = categorizePuzzle(puzzle);

      puzzlesByDifficulty[difficulty].push(puzzle);
      stats[difficulty]++;
      generated++;
    }

    // Log progress
    const percent = ((generated / TARGET_PUZZLES) * 100).toFixed(1);
    log(
      `Generated ${generated}/${TARGET_PUZZLES} (${percent}%) - ` +
        `easy: ${stats.easy}, medium: ${stats.medium}, hard: ${stats.hard}, ` +
        `expert: ${stats.expert}, master: ${stats.master}, unsolvable: ${stats.unsolvable}`,
    );
  }

  log("");
  if (shouldExit) {
    log(
      `Early exit - generated ${generated} puzzles (target was ${TARGET_PUZZLES})`,
    );
  } else {
    log("Generation complete!");
  }
  log(
    `Distribution: easy: ${stats.easy}, medium: ${stats.medium}, hard: ${stats.hard}, ` +
      `expert: ${stats.expert}, master: ${stats.master}, unsolvable: ${stats.unsolvable}`,
  );
  log("");

  // Write output file
  log("Writing to app/sudoku/lib/puzzles.ts...");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = path.join(__dirname, "../lib/puzzles.ts");

  const output = generateOutputFile(puzzlesByDifficulty);
  fs.writeFileSync(outputPath, output, "utf-8");

  log("Done!");
  log(`Total time: ${formatTime(Date.now() - startTime)}`);
}

// ============================================================================
// Output File Generation
// ============================================================================

function generateOutputFile(
  puzzles: Record<DifficultyOrUnsolvable, string[]>,
): string {
  const timestamp = new Date().toISOString();

  const formatPuzzleArray = (arr: string[]): string => {
    if (arr.length === 0) return "[]";

    const lines = arr.map((p) => `    "${p}",`);
    return `[\n${lines.join("\n")}\n  ]`;
  };

  return `// AUTO-GENERATED FILE - Do not edit manually
// Generated by: pnpm sudoku:generate
// Generated at: ${timestamp}
// Total puzzles: ${Object.values(puzzles).reduce((sum, arr) => sum + arr.length, 0)}

import type { Difficulty } from "./types";

type DifficultyOrUnsolvable = Difficulty | "unsolvable";

/** Puzzles grouped by difficulty */
export const PUZZLES_BY_DIFFICULTY: Record<DifficultyOrUnsolvable, string[]> = {
  easy: ${formatPuzzleArray(puzzles.easy)},
  medium: ${formatPuzzleArray(puzzles.medium)},
  hard: ${formatPuzzleArray(puzzles.hard)},
  expert: ${formatPuzzleArray(puzzles.expert)},
  master: ${formatPuzzleArray(puzzles.master)},
  unsolvable: ${formatPuzzleArray(puzzles.unsolvable)},
};

/** Get a random puzzle of specified difficulty */
export function getRandomPuzzle(
  difficulty: DifficultyOrUnsolvable,
): string | null {
  const puzzles = PUZZLES_BY_DIFFICULTY[difficulty];
  if (puzzles.length === 0) return null;
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

/** Get puzzle counts by difficulty */
export function getPuzzleCounts(): Record<DifficultyOrUnsolvable, number> {
  return {
    easy: PUZZLES_BY_DIFFICULTY.easy.length,
    medium: PUZZLES_BY_DIFFICULTY.medium.length,
    hard: PUZZLES_BY_DIFFICULTY.hard.length,
    expert: PUZZLES_BY_DIFFICULTY.expert.length,
    master: PUZZLES_BY_DIFFICULTY.master.length,
    unsolvable: PUZZLES_BY_DIFFICULTY.unsolvable.length,
  };
}

/** Get all puzzles as a flat array with difficulty info */
export function getAllPuzzles(): Array<{
  puzzle: string;
  difficulty: DifficultyOrUnsolvable;
}> {
  const result: Array<{ puzzle: string; difficulty: DifficultyOrUnsolvable }> =
    [];

  for (const [difficulty, puzzles] of Object.entries(PUZZLES_BY_DIFFICULTY)) {
    for (const puzzle of puzzles) {
      result.push({ puzzle, difficulty: difficulty as DifficultyOrUnsolvable });
    }
  }

  return result;
}
`;
}

// ============================================================================
// Run
// ============================================================================

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

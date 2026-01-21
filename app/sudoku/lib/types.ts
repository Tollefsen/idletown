// Sudoku Difficulty Analyzer - Core Types

/** A value 1-9 or null for empty cells */
export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null;

/** Set of possible candidates for a cell */
export type Candidates = Set<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>;

/** A single cell in the grid */
export interface Cell {
  value: CellValue;
  candidates: Candidates;
  isGiven: boolean; // true if part of the original puzzle
  row: number; // 0-8
  col: number; // 0-8
  box: number; // 0-8 (3x3 box index)
}

/** 9x9 grid represented as a flat array of 81 cells */
export type SudokuGrid = Cell[];

/** Difficulty levels for techniques and puzzles */
export type Difficulty = "easy" | "medium" | "hard" | "expert" | "master";

/** Result of applying a technique */
export interface TechniqueResult {
  /** Technique that was applied */
  techniqueId: string;
  /** Cells that had values placed */
  placements: Array<{ row: number; col: number; value: CellValue }>;
  /** Candidates that were eliminated */
  eliminations: Array<{
    row: number;
    col: number;
    candidates: number[];
  }>;
  /** Human-readable description of what was found */
  description: string;
}

/** Definition of a solving technique */
export interface Technique {
  id: string;
  name: string;
  difficulty: Difficulty;
  /** Whether this technique is actually implemented or just a placeholder */
  implemented: boolean;
  /** Description of what this technique does */
  description: string;
  /**
   * Apply this technique to the grid.
   * Returns a result if the technique found something, null otherwise.
   * Should not mutate the grid - returns what changes should be made.
   */
  apply: (grid: SudokuGrid) => TechniqueResult | null;
}

/** Technique usage statistics after solving */
export interface TechniqueUsage {
  techniqueId: string;
  techniqueName: string;
  difficulty: Difficulty;
  count: number;
  implemented: boolean;
}

/** Result of analyzing a puzzle's difficulty */
export interface AnalysisResult {
  /** Whether the puzzle was solved completely */
  solved: boolean;
  /** The solved grid (or as far as we got) */
  grid: SudokuGrid;
  /** Overall difficulty rating */
  difficulty: Difficulty | "unsolvable";
  /** Techniques used and how many times */
  techniqueUsage: TechniqueUsage[];
  /** The hardest technique that was required */
  hardestTechnique: string | null;
  /** Whether solving required an unimplemented technique */
  requiresUnimplemented: boolean;
  /** Total steps taken */
  totalSteps: number;
  /** Map of cell index -> difficulty level that solved it */
  cellDifficulty: Map<number, Difficulty>;
}

/** Example puzzle for loading */
export interface ExamplePuzzle {
  name: string;
  difficulty: Difficulty;
  /** 81-character string, 0 or . for empty cells */
  puzzle: string;
}

// Helper type for the 9 possible digit values
export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Unit indices for rows, columns, and boxes
export type UnitType = "row" | "col" | "box";

export interface Unit {
  type: UnitType;
  index: number;
  cells: number[]; // Indices into the flat 81-cell array
}

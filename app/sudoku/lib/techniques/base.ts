// Base technique factory for creating placeholder techniques

import type {
  Difficulty,
  SudokuGrid,
  Technique,
  TechniqueResult,
} from "../types";

/** Create a placeholder technique that is not yet implemented */
export function createPlaceholderTechnique(
  id: string,
  name: string,
  difficulty: Difficulty,
  description: string,
): Technique {
  return {
    id,
    name,
    difficulty,
    implemented: false,
    description,
    apply: (_grid: SudokuGrid): TechniqueResult | null => {
      // Placeholder - always returns null (technique not applied)
      return null;
    },
  };
}

/** Difficulty order for comparison */
export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
  master: 5,
};

/** Compare two difficulty levels */
export function compareDifficulty(a: Difficulty, b: Difficulty): number {
  return DIFFICULTY_ORDER[a] - DIFFICULTY_ORDER[b];
}

/** Get the harder of two difficulty levels */
export function maxDifficulty(a: Difficulty, b: Difficulty): Difficulty {
  return DIFFICULTY_ORDER[a] >= DIFFICULTY_ORDER[b] ? a : b;
}

/**
 * Example Puzzle Verification Tests
 *
 * This file verifies that EXAMPLE_PUZZLES in useSudoku.ts are correct:
 * - Each puzzle is solvable
 * - Each puzzle matches its claimed difficulty
 * - Each puzzle uses the expected technique(s)
 *
 * Run with: pnpm exec vitest run app/sudoku/lib/__tests__/examples.test.ts
 */

import { describe, expect, it } from "vitest";
import { EXAMPLE_PUZZLES } from "../../hooks/useSudoku";
import { parseGrid } from "../candidates";
import { analyzePuzzle } from "../solver";
import type { AnalysisResult, Difficulty } from "../types";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Print analysis results in a readable format
 */
function printAnalysis(name: string, result: AnalysisResult): void {
  const techniqueList = result.techniqueUsage
    .filter((t) => t.count > 0)
    .map((t) => `${t.techniqueName}(${t.count})`)
    .join(", ");

  console.log(`${name}: ${techniqueList}`);
}

/**
 * Get the key technique that makes a puzzle its difficulty level
 * Returns the hardest non-easy technique used, or null for easy puzzles
 */
function getKeyTechnique(result: AnalysisResult): string | null {
  const hardTechniques = result.techniqueUsage
    .filter((t) => t.count > 0 && t.difficulty !== "easy")
    .sort((a, b) => {
      const order: Record<Difficulty, number> = {
        easy: 0,
        medium: 1,
        hard: 2,
        expert: 3,
        master: 4,
      };
      return order[b.difficulty] - order[a.difficulty];
    });

  return hardTechniques[0]?.techniqueId || null;
}

// ============================================================================
// EXPECTED KEY TECHNIQUES FOR EACH EXAMPLE
// ============================================================================

/**
 * Map of example puzzle names to expected key techniques
 * Used to verify that puzzles actually demonstrate the techniques they claim
 */
const EXPECTED_TECHNIQUES: Record<string, string | null> = {
  "Easy - Singles Only": null, // Singles only, no advanced techniques
  "Medium - Naked Pairs": "naked-pairs",
  "Medium - Pointing Pairs": "pointing-pairs",
  "Hard - Naked Triples": "naked-triples",
};

// ============================================================================
// TESTS
// ============================================================================

describe("Sudoku Example Puzzles", () => {
  describe("EXAMPLE_PUZZLES verification", () => {
    it.each(EXAMPLE_PUZZLES)(
      "$name should solve with difficulty: $difficulty",
      (example) => {
        const grid = parseGrid(example.puzzle);
        const result = analyzePuzzle(grid);

        // Log for visibility
        printAnalysis(example.name, result);

        // Should be solvable
        expect(result.solved).toBe(true);

        // Should match claimed difficulty
        expect(result.difficulty).toBe(example.difficulty);

        // Should use expected key technique (if specified)
        const expectedTechnique = EXPECTED_TECHNIQUES[example.name];
        if (expectedTechnique !== undefined) {
          const keyTechnique = getKeyTechnique(result);
          expect(keyTechnique).toBe(expectedTechnique);
        }
      },
    );
  });

  describe("Puzzle validity checks", () => {
    it("all puzzles have valid 81-character strings", () => {
      for (const example of EXAMPLE_PUZZLES) {
        expect(example.puzzle.length).toBe(81);
        expect(example.puzzle).toMatch(/^[0-9.]+$/);
      }
    });

    it("all puzzles have unique names", () => {
      const names = EXAMPLE_PUZZLES.map((p) => p.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("all puzzles have valid difficulty values", () => {
      const validDifficulties: Difficulty[] = [
        "easy",
        "medium",
        "hard",
        "expert",
        "master",
      ];
      for (const example of EXAMPLE_PUZZLES) {
        expect(validDifficulties).toContain(example.difficulty);
      }
    });
  });
});

// ============================================================================
// CANDIDATE PUZZLE TESTING (for finding new examples)
// ============================================================================

/**
 * Candidate puzzles to test when looking for new examples.
 * Uncomment and modify this section when searching for new puzzles.
 */

/*
interface CandidatePuzzle {
  name: string;
  puzzle: string;
  expectedTechnique?: string;
  source?: string;
}

const CANDIDATE_PUZZLES: CandidatePuzzle[] = [
  // Add candidate puzzles here for testing
  // {
  //   name: "Medium - Hidden Pairs Candidate",
  //   puzzle: "...",
  //   expectedTechnique: "hidden-pairs",
  //   source: "SudokuWiki",
  // },
];

describe("Candidate puzzle analysis", () => {
  it.skip("analyzes candidate puzzles", () => {
    for (const candidate of CANDIDATE_PUZZLES) {
      const grid = parseGrid(candidate.puzzle);
      const result = analyzePuzzle(grid);

      console.log(`\n=== ${candidate.name} ===`);
      console.log(`Solved: ${result.solved}`);
      console.log(`Difficulty: ${result.difficulty}`);

      const techniques = result.techniqueUsage
        .filter((t) => t.count > 0)
        .map((t) => `${t.techniqueName}: ${t.count}`)
        .join(", ");
      console.log(`Techniques: ${techniques}`);

      if (!result.solved) {
        const unsolvedCount = result.grid.filter((c) => c.value === null).length;
        console.log(`Unsolved cells: ${unsolvedCount}`);
      }
    }
  });
});
*/

"use client";

import { useCallback, useState } from "react";
import { createEmptyGrid, parseGrid, toIndex } from "../lib/candidates";
import { getRandomPuzzle, PUZZLES_BY_DIFFICULTY } from "../lib/puzzles";
import { analyzePuzzle, isValidGrid } from "../lib/solver";
import type {
  AnalysisResult,
  CellValue,
  Difficulty,
  Digit,
  ExamplePuzzle,
  SudokuGrid,
} from "../lib/types";

// Example puzzles for quick loading - pulled from generated puzzles
const examplePuzzleConfigs: Array<{
  name: string;
  difficulty: Difficulty;
  puzzle: string | undefined;
}> = [
  {
    name: "Easy",
    difficulty: "easy",
    puzzle: PUZZLES_BY_DIFFICULTY.easy[0],
  },
  {
    name: "Medium",
    difficulty: "medium",
    puzzle: PUZZLES_BY_DIFFICULTY.medium[0],
  },
  {
    name: "Hard",
    difficulty: "hard",
    puzzle: PUZZLES_BY_DIFFICULTY.hard[0],
  },
  {
    name: "Expert",
    difficulty: "expert",
    puzzle: PUZZLES_BY_DIFFICULTY.expert[0],
  },
  {
    name: "Master",
    difficulty: "master",
    puzzle: PUZZLES_BY_DIFFICULTY.master[0],
  },
];

export const EXAMPLE_PUZZLES: ExamplePuzzle[] = examplePuzzleConfigs.filter(
  (p): p is { name: string; difficulty: Difficulty; puzzle: string } =>
    typeof p.puzzle === "string" && p.puzzle !== "",
);

export interface UseSudokuReturn {
  grid: SudokuGrid;
  selectedCell: { row: number; col: number } | null;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  isValid: boolean;
  /** The solved grid after analysis (null if not analyzed) */
  solvedGrid: SudokuGrid | null;
  /** Map of cell index -> difficulty that solved it */
  cellDifficulty: Map<number, Difficulty> | null;

  // Actions
  selectCell: (row: number, col: number) => void;
  setCellValue: (row: number, col: number, value: CellValue) => void;
  clearGrid: () => void;
  loadExample: (puzzle: ExamplePuzzle) => void;
  loadRandomPuzzle: (difficulty: Difficulty) => void;
  analyze: () => void;
}

export function useSudoku(): UseSudokuReturn {
  const [grid, setGrid] = useState<SudokuGrid>(() => createEmptyGrid());
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Check if current grid is valid
  const isValid = isValidGrid(grid);

  const selectCell = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const setCellValue = useCallback(
    (row: number, col: number, value: CellValue) => {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        const idx = toIndex(row, col);

        // Don't modify given cells
        if (newGrid[idx].isGiven) {
          return prevGrid;
        }

        newGrid[idx] = {
          ...newGrid[idx],
          value,
          candidates:
            value === null
              ? new Set([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[])
              : new Set(),
        };

        return newGrid;
      });

      // Clear analysis when grid changes
      setAnalysisResult(null);
    },
    [],
  );

  const clearGrid = useCallback(() => {
    setGrid(createEmptyGrid());
    setSelectedCell(null);
    setAnalysisResult(null);
  }, []);

  const loadExample = useCallback((puzzle: ExamplePuzzle) => {
    setGrid(parseGrid(puzzle.puzzle));
    setSelectedCell(null);
    setAnalysisResult(null);
  }, []);

  const loadRandomPuzzle = useCallback((difficulty: Difficulty) => {
    const puzzleString = getRandomPuzzle(difficulty);
    if (puzzleString) {
      setGrid(parseGrid(puzzleString));
      setSelectedCell(null);
      setAnalysisResult(null);
    }
  }, []);

  const analyze = useCallback(() => {
    setIsAnalyzing(true);

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const result = analyzePuzzle(grid);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 10);
  }, [grid]);

  return {
    grid,
    selectedCell,
    analysisResult,
    isAnalyzing,
    isValid,
    solvedGrid: analysisResult?.grid ?? null,
    cellDifficulty: analysisResult?.cellDifficulty ?? null,
    selectCell,
    setCellValue,
    clearGrid,
    loadExample,
    loadRandomPuzzle,
    analyze,
  };
}

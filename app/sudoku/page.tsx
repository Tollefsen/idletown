"use client";

import { BackLink } from "../components/BackLink";
import { DifficultyPanel } from "./components/DifficultyPanel";
import { SudokuBoard } from "./components/SudokuBoard";
import { EXAMPLE_PUZZLES, useSudoku } from "./hooks/useSudoku";

export default function SudokuPage() {
  const {
    grid,
    selectedCell,
    analysisResult,
    isAnalyzing,
    isValid,
    solvedGrid,
    cellDifficulty,
    selectCell,
    setCellValue,
    clearGrid,
    loadExample,
    analyze,
  } = useSudoku();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Navigation */}
        <BackLink className="mb-4" />

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Sudoku Difficulty Analyzer
          </h1>
          <p className="mt-2 text-gray-600">
            Enter a Sudoku puzzle to analyze its difficulty based on solving
            techniques required
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: Board and Controls */}
          <div className="flex flex-col items-center">
            {/* Sudoku Board */}
            <SudokuBoard
              grid={grid}
              selectedCell={selectedCell}
              solvedGrid={solvedGrid}
              cellDifficulty={cellDifficulty}
              onSelectCell={selectCell}
              onCellChange={setCellValue}
            />

            {/* Validation Error */}
            {!isValid && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                Invalid puzzle: duplicate values detected
              </div>
            )}

            {/* Controls */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={analyze}
                disabled={isAnalyzing || !isValid}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
              <button
                type="button"
                onClick={clearGrid}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            {/* Example Puzzles */}
            <div className="mt-6">
              <h3 className="mb-3 text-center text-sm font-medium text-gray-600">
                Load Example Puzzle
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLE_PUZZLES.map((puzzle) => (
                  <button
                    type="button"
                    key={puzzle.name}
                    onClick={() => loadExample(puzzle)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                  >
                    {puzzle.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 max-w-md text-center text-sm text-gray-500">
              <p>
                <strong>How to use:</strong> Click a cell and type 1-9 to enter
                a value. Use arrow keys to navigate. Press Backspace or Delete
                to clear a cell.
              </p>
            </div>
          </div>

          {/* Right: Analysis Panel */}
          <div className="min-w-[300px] flex-1 lg:max-w-md">
            <DifficultyPanel
              result={analysisResult}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>
            Analyzes puzzles using 18 techniques from Naked Singles to Forcing
            Chains.
          </p>
        </div>
      </div>
    </div>
  );
}

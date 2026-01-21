"use client";

import {
  getDifficultyColor,
  getDifficultyDescription,
  getDifficultyLabel,
} from "../lib/difficulty";
import type { AnalysisResult } from "../lib/types";
import { TechniqueList } from "./TechniqueList";

interface DifficultyPanelProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
}

export function DifficultyPanel({ result, isAnalyzing }: DifficultyPanelProps) {
  if (isAnalyzing) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <span className="ml-2 text-gray-600">Analyzing...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Difficulty Analysis
        </h3>
        <p className="text-gray-500">
          Enter a Sudoku puzzle and click &quot;Analyze&quot; to see its
          difficulty rating.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Difficulty Analysis
      </h3>

      {/* Difficulty Badge */}
      <div className="mb-6">
        <div
          className={`inline-block rounded-lg px-4 py-2 text-lg font-bold ${getDifficultyColor(result.difficulty)}`}
        >
          {getDifficultyLabel(result.difficulty)}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {getDifficultyDescription(result.difficulty)}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-2xl font-bold text-gray-800">
            {result.totalSteps}
          </div>
          <div className="text-xs text-gray-500">Total Steps</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-2xl font-bold text-gray-800">
            {result.solved ? "Yes" : "No"}
          </div>
          <div className="text-xs text-gray-500">Solved</div>
        </div>
      </div>

      {/* Warning if requires unimplemented */}
      {result.requiresUnimplemented && !result.solved && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          This puzzle may require techniques that are not yet implemented.
        </div>
      )}

      {/* Techniques Used */}
      <div>
        <h4 className="mb-3 font-semibold text-gray-700">Techniques</h4>
        <TechniqueList techniqueUsage={result.techniqueUsage} showAll />
      </div>
    </div>
  );
}

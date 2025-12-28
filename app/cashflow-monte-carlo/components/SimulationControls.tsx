"use client";

import { useId } from "react";

type SimulationControlsProps = {
  iterations: number;
  onIterationsChange: (iterations: number) => void;
  onRun: () => void;
  isRunning: boolean;
  progress: number; // 0-100
};

const ITERATION_OPTIONS = [100, 500, 1000, 2500, 5000, 10000];

export function SimulationControls({
  iterations,
  onIterationsChange,
  onRun,
  isRunning,
  progress,
}: SimulationControlsProps) {
  const iterationsId = useId();

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div className="flex items-center gap-2">
        <label
          htmlFor={iterationsId}
          className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
        >
          Iterations:
        </label>
        <select
          id={iterationsId}
          value={iterations}
          onChange={(e) => onIterationsChange(Number(e.target.value))}
          disabled={isRunning}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 disabled:opacity-50"
        >
          {ITERATION_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onRun}
        disabled={isRunning}
        className="flex-1 sm:flex-none px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isRunning ? "Running..." : "Run Simulation"}
      </button>

      {isRunning && (
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
            {progress.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}

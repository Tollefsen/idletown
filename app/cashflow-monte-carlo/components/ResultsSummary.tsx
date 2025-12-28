"use client";

import type { SimulationResult } from "../types";

type ResultsSummaryProps = {
  result: SimulationResult | null;
  currency: string;
  goalAmount?: number;
};

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function ResultsSummary({
  result,
  currency,
  goalAmount,
}: ResultsSummaryProps) {
  if (!result) {
    return (
      <div className="text-gray-500 text-center py-8">
        Run a simulation to see summary statistics
      </div>
    );
  }

  const finalStats = result.monthlyStats[result.monthlyStats.length - 1];
  const distribution = result.finalBalanceDistribution;

  // Calculate additional statistics
  const min = distribution[0];
  const max = distribution[distribution.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Pessimistic (P10)
          </p>
          <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
            {formatCurrency(finalStats.p10, currency)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">
            Median (P50)
          </p>
          <p className="text-xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(finalStats.p50, currency)}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Optimistic (P90)
          </p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
            {formatCurrency(finalStats.p90, currency)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Probability of Positive Balance
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatPercent(result.probabilityPositive)}
          </p>
        </div>
        {goalAmount !== undefined && result.probabilityGoal !== undefined && (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Probability of {formatCurrency(goalAmount, currency)}+
            </p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {formatPercent(result.probabilityGoal)}
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Final Balance Range
        </p>
        <div className="flex justify-between text-sm">
          <span>
            Worst:{" "}
            <span className="font-medium text-red-600">
              {formatCurrency(min, currency)}
            </span>
          </span>
          <span>
            Mean:{" "}
            <span className="font-medium">
              {formatCurrency(finalStats.mean, currency)}
            </span>
          </span>
          <span>
            Best:{" "}
            <span className="font-medium text-green-600">
              {formatCurrency(max, currency)}
            </span>
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-right">
        Simulation completed in {result.runTimeMs.toFixed(0)}ms
      </p>
    </div>
  );
}

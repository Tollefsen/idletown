"use client";

import type { CalculationResult, SampleSizeParams } from "../types";

interface ResultsSummaryProps {
  result: CalculationResult | null;
  params: SampleSizeParams;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function ResultsSummary({ result, params }: ResultsSummaryProps) {
  if (!result) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Enter parameters to calculate sample size
      </div>
    );
  }

  const { sampleSizePerVariation, totalSampleSize, absoluteEffect, newRate } =
    result;

  return (
    <div className="space-y-4">
      {/* Main Result */}
      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
            Sample Size Per Variation
          </p>
          <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
            {formatNumber(sampleSizePerVariation)}
          </p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Total Sample Size
          </p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {formatNumber(totalSampleSize)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            across {params.variations} variations
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Expected Effect
          </p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {formatPercentage(params.baselineRate)} →{" "}
            {formatPercentage(newRate)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            +{formatPercentage(absoluteEffect)} absolute
          </p>
        </div>
      </div>

      {/* Interpretation */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <p>
          With <strong>{formatNumber(sampleSizePerVariation)}</strong> visitors
          per variation, you have a{" "}
          <strong>{formatPercentage(params.power, 0)}</strong> chance of
          detecting a{" "}
          <strong>
            {formatPercentage(params.mde, 0)} relative improvement
          </strong>{" "}
          (from {formatPercentage(params.baselineRate)} to{" "}
          {formatPercentage(newRate)}) with{" "}
          <strong>{formatPercentage(params.significanceLevel, 0)}</strong>{" "}
          statistical significance.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { BackLink, Card } from "../components";
import {
  calculateSampleSize,
  generateChartData,
} from "./calculation/sampleSize";
import { DurationEstimate } from "./components/DurationEstimate";
import { HowItWorks } from "./components/HowItWorks";
import { InputPanel } from "./components/InputPanel";
import { ResultsSummary } from "./components/ResultsSummary";
import { SampleSizeChart } from "./components/SampleSizeChart";
import { ScenarioManager } from "./components/ScenarioManager";
import { DEFAULT_PARAMS } from "./presets";
import type {
  CalculationResult,
  ChartDataPoint,
  SampleSizeParams,
} from "./types";

export default function SampleSizeCalculatorPage() {
  const [params, setParams] = useState<SampleSizeParams>(DEFAULT_PARAMS);
  const [error, setError] = useState<string | null>(null);

  // Calculate result whenever params change
  const result = useMemo<CalculationResult | null>(() => {
    try {
      setError(null);
      return calculateSampleSize(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed");
      return null;
    }
  }, [params]);

  // Generate chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    try {
      return generateChartData({
        baselineRate: params.baselineRate,
        significanceLevel: params.significanceLevel,
        power: params.power,
        tails: params.tails,
        variations: params.variations,
        mdeMin: 0.01,
        mdeMax: 0.5,
        points: 50,
      });
    } catch {
      return [];
    }
  }, [
    params.baselineRate,
    params.significanceLevel,
    params.power,
    params.tails,
    params.variations,
  ]);

  const handleParamsChange = useCallback((newParams: SampleSizeParams) => {
    setParams(newParams);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <BackLink />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            Sample Size Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Calculate the required sample size for statistically significant A/B
            test results
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Inputs */}
          <div className="space-y-6">
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Test Parameters
              </h2>
              <InputPanel params={params} onChange={handleParamsChange} />
            </Card>

            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Presets & Saved Scenarios
              </h2>
              <ScenarioManager
                currentParams={params}
                onParamsChange={handleParamsChange}
              />
            </Card>
          </div>

          {/* Right column: Results & Chart */}
          <div className="space-y-6">
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Required Sample Size
              </h2>
              {error ? (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
                  {error}
                </div>
              ) : (
                <ResultsSummary result={result} params={params} />
              )}
            </Card>

            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Sample Size by Effect Size
              </h2>
              <SampleSizeChart data={chartData} currentMde={params.mde} />
            </Card>

            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Duration Estimate
              </h2>
              <DurationEstimate
                sampleSizePerVariation={result?.sampleSizePerVariation ?? null}
                variations={params.variations}
              />
            </Card>
          </div>
        </div>

        {/* Educational content - full width */}
        <div className="mt-6">
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              How It Works
            </h2>
            <HowItWorks />
          </Card>
        </div>
      </div>
    </div>
  );
}

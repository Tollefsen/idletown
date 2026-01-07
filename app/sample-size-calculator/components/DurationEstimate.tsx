"use client";

import { useMemo, useState } from "react";
import { calculateDuration } from "../calculation/sampleSize";
import type { DurationEstimate as DurationEstimateType } from "../types";

interface DurationEstimateProps {
  sampleSizePerVariation: number | null;
  variations: number;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DurationEstimate({
  sampleSizePerVariation,
  variations,
}: DurationEstimateProps) {
  const [dailyTraffic, setDailyTraffic] = useState<number | "">(10000);
  const [trafficAllocation, setTrafficAllocation] = useState<number>(100);

  const estimate = useMemo<DurationEstimateType | null>(() => {
    if (!sampleSizePerVariation || !dailyTraffic || dailyTraffic <= 0) {
      return null;
    }

    try {
      return calculateDuration(
        sampleSizePerVariation,
        variations,
        dailyTraffic,
        trafficAllocation / 100,
      );
    } catch {
      return null;
    }
  }, [sampleSizePerVariation, variations, dailyTraffic, trafficAllocation]);

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="daily-traffic"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Daily Visitors
          </label>
          <input
            id="daily-traffic"
            type="number"
            min="1"
            step="100"
            value={dailyTraffic}
            onChange={(e) => {
              const value = e.target.value;
              setDailyTraffic(value === "" ? "" : Number.parseInt(value, 10));
            }}
            placeholder="e.g., 10000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="traffic-allocation"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Test Allocation
          </label>
          <div className="flex items-center gap-2">
            <input
              id="traffic-allocation"
              type="number"
              min="1"
              max="100"
              step="5"
              value={trafficAllocation}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value, 10);
                if (!Number.isNaN(value) && value >= 1 && value <= 100) {
                  setTrafficAllocation(value);
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500 dark:text-gray-400 w-6">%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      {estimate ? (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                Estimated Duration
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {estimate.days} {estimate.days === 1 ? "day" : "days"}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                Est. Completion
              </p>
              <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                {formatDate(estimate.completionDate)}
              </p>
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-3">
            Based on {formatNumber(Math.round(estimate.dailyTestTraffic))}{" "}
            visitors/day allocated to the test
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
          {!sampleSizePerVariation
            ? "Calculate sample size first to see duration estimate"
            : "Enter your daily traffic to see duration estimate"}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Test allocation is the percentage of traffic included in the experiment.
        100% means all visitors are part of the test.
      </p>
    </div>
  );
}

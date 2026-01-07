"use client";

import { Tooltip } from "@/app/components";
import { POWER_LEVELS, SIGNIFICANCE_LEVELS } from "../calculation/sampleSize";
import type { SampleSizeParams } from "../types";

interface InputPanelProps {
  params: SampleSizeParams;
  onChange: (params: SampleSizeParams) => void;
}

function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

interface LabelWithTooltipProps {
  htmlFor: string;
  label: string;
  tooltip: string;
}

function LabelWithTooltip({ htmlFor, label, tooltip }: LabelWithTooltipProps) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <Tooltip content={tooltip} position="right">
        <InfoIcon />
      </Tooltip>
    </div>
  );
}

export function InputPanel({ params, onChange }: InputPanelProps) {
  const updateParam = <K extends keyof SampleSizeParams>(
    key: K,
    value: SampleSizeParams[K],
  ) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="space-y-5">
      {/* Baseline Conversion Rate */}
      <div>
        <LabelWithTooltip
          htmlFor="baseline-rate"
          label="Baseline Conversion Rate"
          tooltip="Your current conversion rate before running the test"
        />
        <div className="flex items-center gap-2">
          <input
            id="baseline-rate"
            type="number"
            min="0.1"
            max="99.9"
            step="0.1"
            value={(params.baselineRate * 100).toFixed(1)}
            onChange={(e) => {
              const value = Number.parseFloat(e.target.value);
              if (!Number.isNaN(value) && value > 0 && value < 100) {
                updateParam("baselineRate", value / 100);
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500 dark:text-gray-400 w-6">%</span>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Your current conversion rate before the test
        </p>
      </div>

      {/* Minimum Detectable Effect */}
      <div>
        <LabelWithTooltip
          htmlFor="mde"
          label="Minimum Detectable Effect (MDE)"
          tooltip="The smallest relative improvement you want to detect"
        />
        <div className="flex items-center gap-2">
          <input
            id="mde"
            type="number"
            min="1"
            max="100"
            step="1"
            value={(params.mde * 100).toFixed(0)}
            onChange={(e) => {
              const value = Number.parseFloat(e.target.value);
              if (!Number.isNaN(value) && value > 0 && value <= 100) {
                updateParam("mde", value / 100);
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500 dark:text-gray-400 w-6">%</span>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Relative improvement to detect (e.g., 10% means{" "}
          {(params.baselineRate * 100).toFixed(1)}% →{" "}
          {(params.baselineRate * (1 + params.mde) * 100).toFixed(1)}%)
        </p>
      </div>

      {/* Statistical Significance */}
      <div>
        <LabelWithTooltip
          htmlFor="significance"
          label="Statistical Significance"
          tooltip="Confidence that results aren't due to random chance (95% is standard)"
        />
        <select
          id="significance"
          value={params.significanceLevel}
          onChange={(e) =>
            updateParam("significanceLevel", Number.parseFloat(e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {SIGNIFICANCE_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Confidence that results aren&apos;t due to chance (95% is standard)
        </p>
      </div>

      {/* Statistical Power */}
      <div>
        <LabelWithTooltip
          htmlFor="power"
          label="Statistical Power"
          tooltip="Probability of detecting a real effect when one exists (80% is typical)"
        />
        <select
          id="power"
          value={params.power}
          onChange={(e) =>
            updateParam("power", Number.parseFloat(e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {POWER_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Probability of detecting a real effect (80% is typical)
        </p>
      </div>

      {/* Test Type */}
      <div>
        <LabelWithTooltip
          htmlFor="tails"
          label="Test Type"
          tooltip="Two-tailed detects any difference; one-tailed only detects improvement"
        />
        <select
          id="tails"
          value={params.tails}
          onChange={(e) =>
            updateParam("tails", e.target.value as "one" | "two")
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="two">Two-tailed (detect any difference)</option>
          <option value="one">One-tailed (detect improvement only)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Two-tailed is recommended unless you only care about improvements
        </p>
      </div>

      {/* Number of Variations */}
      <div>
        <LabelWithTooltip
          htmlFor="variations"
          label="Number of Variations"
          tooltip="More variations require larger samples due to Bonferroni correction"
        />
        <select
          id="variations"
          value={params.variations}
          onChange={(e) =>
            updateParam("variations", Number.parseInt(e.target.value, 10))
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={2}>2 (A/B test)</option>
          <option value={3}>3 (A/B/C test)</option>
          <option value={4}>4 variations</option>
          <option value={5}>5 variations</option>
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          More variations require larger sample sizes (Bonferroni correction)
        </p>
      </div>
    </div>
  );
}

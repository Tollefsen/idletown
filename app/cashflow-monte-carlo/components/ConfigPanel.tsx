"use client";

import { useId } from "react";
import type { SimulationConfig } from "../types";
import { DistributionInput } from "./DistributionInput";

type ConfigPanelProps = {
  config: SimulationConfig;
  onChange: (config: SimulationConfig) => void;
};

const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "NOK",
  "SEK",
  "DKK",
  "CHF",
  "JPY",
  "CAD",
  "AUD",
];

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  const horizonId = useId();
  const currencyId = useId();

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
        Simulation Config
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={horizonId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Time Horizon (months)
          </label>
          <input
            id={horizonId}
            type="number"
            min="1"
            max="600"
            value={config.timeHorizonMonths}
            onChange={(e) =>
              onChange({ ...config, timeHorizonMonths: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">
            = {(config.timeHorizonMonths / 12).toFixed(1)} years
          </p>
        </div>
        <div>
          <label
            htmlFor={currencyId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Currency
          </label>
          <select
            id={currencyId}
            value={config.currency}
            onChange={(e) => onChange({ ...config, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DistributionInput
        label="Initial Balance"
        value={config.initialBalance}
        onChange={(initialBalance) => onChange({ ...config, initialBalance })}
      />

      <DistributionInput
        label="Annual Inflation Rate"
        value={config.inflationRate}
        onChange={(inflationRate) => onChange({ ...config, inflationRate })}
        showPercentage
      />
    </div>
  );
}

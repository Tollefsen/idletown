"use client";

import { useId, useState } from "react";
import type {
  CashFlowParameter,
  Distribution,
  Frequency,
  ParameterCategory,
} from "../types";
import { CATEGORY_LABELS, FREQUENCY_LABELS } from "../types";
import { DistributionInput } from "./DistributionInput";

type ParameterCardProps = {
  parameter: CashFlowParameter;
  onChange: (parameter: CashFlowParameter) => void;
  onDelete: () => void;
};

export function ParameterCard({
  parameter,
  onChange,
  onDelete,
}: ParameterCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const baseId = useId();

  const handleAmountChange = (amount: Distribution) => {
    onChange({ ...parameter, amount });
  };

  const handleGrowthRateChange = (growthRate: Distribution) => {
    onChange({ ...parameter, growthRate });
  };

  const handleReturnRateChange = (returnRate: Distribution) => {
    onChange({ ...parameter, returnRate });
  };

  const nameId = `${baseId}-name`;
  const categoryId = `${baseId}-category`;
  const frequencyId = `${baseId}-frequency`;
  const startMonthId = `${baseId}-start`;
  const endMonthId = `${baseId}-end`;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left flex-1"
        >
          <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {parameter.name || "Unnamed"}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {CATEGORY_LABELS[parameter.category]}
          </span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 text-sm px-2"
          title="Delete parameter"
        >
          Delete
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={nameId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Name
              </label>
              <input
                id={nameId}
                type="text"
                value={parameter.name}
                onChange={(e) =>
                  onChange({ ...parameter, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="e.g., Salary, Rent, etc."
              />
            </div>
            <div>
              <label
                htmlFor={categoryId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Category
              </label>
              <select
                id={categoryId}
                value={parameter.category}
                onChange={(e) =>
                  onChange({
                    ...parameter,
                    category: e.target.value as ParameterCategory,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={frequencyId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Frequency
              </label>
              <select
                id={frequencyId}
                value={parameter.frequency}
                onChange={(e) =>
                  onChange({
                    ...parameter,
                    frequency: e.target.value as Frequency,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor={startMonthId}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Start Month
                </label>
                <input
                  id={startMonthId}
                  type="number"
                  min="0"
                  value={parameter.startMonth ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...parameter,
                      startMonth: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label
                  htmlFor={endMonthId}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  End Month
                </label>
                <input
                  id={endMonthId}
                  type="number"
                  min="0"
                  value={parameter.endMonth ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...parameter,
                      endMonth: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="∞"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DistributionInput
              label="Amount"
              value={parameter.amount}
              onChange={handleAmountChange}
            />
            <DistributionInput
              label="Annual Growth Rate"
              value={parameter.growthRate}
              onChange={handleGrowthRateChange}
              showPercentage
            />
          </div>

          {parameter.category === "investment" && (
            <DistributionInput
              label="Annual Return Rate"
              value={
                parameter.returnRate ?? {
                  type: "normal",
                  mean: 0.07,
                  stdDev: 0.15,
                }
              }
              onChange={handleReturnRateChange}
              showPercentage
            />
          )}
        </div>
      )}
    </div>
  );
}

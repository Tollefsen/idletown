"use client";

import type { CashFlowParameter, ParameterCategory } from "../types";
import { CATEGORY_LABELS } from "../types";
import { ParameterCard } from "./ParameterCard";

type ParameterListProps = {
  parameters: CashFlowParameter[];
  onChange: (parameters: CashFlowParameter[]) => void;
};

function createNewParameter(category: ParameterCategory): CashFlowParameter {
  return {
    id: crypto.randomUUID(),
    name: "",
    category,
    amount: { type: "fixed", value: 0 },
    growthRate: { type: "fixed", value: 0 },
    frequency: category === "one-time" ? "one-time" : "monthly",
  };
}

export function ParameterList({ parameters, onChange }: ParameterListProps) {
  const handleParameterChange = (index: number, updated: CashFlowParameter) => {
    const newParams = [...parameters];
    newParams[index] = updated;
    onChange(newParams);
  };

  const handleDelete = (index: number) => {
    const newParams = parameters.filter((_, i) => i !== index);
    onChange(newParams);
  };

  const handleAdd = (category: ParameterCategory) => {
    onChange([...parameters, createNewParameter(category)]);
  };

  const categories: ParameterCategory[] = [
    "income",
    "expense",
    "investment",
    "one-time",
  ];

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryParams = parameters
          .map((p, index) => ({ param: p, index }))
          .filter(({ param }) => param.category === category);

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {CATEGORY_LABELS[category]}
              </h3>
              <button
                type="button"
                onClick={() => handleAdd(category)}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add
              </button>
            </div>

            {categoryParams.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-2">
                No {CATEGORY_LABELS[category].toLowerCase()} defined
              </p>
            ) : (
              <div className="space-y-2">
                {categoryParams.map(({ param, index }) => (
                  <ParameterCard
                    key={param.id}
                    parameter={param}
                    onChange={(updated) =>
                      handleParameterChange(index, updated)
                    }
                    onDelete={() => handleDelete(index)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

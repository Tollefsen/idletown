"use client";

import { useId } from "react";
import type { Distribution, DistributionType } from "../types";
import { DEFAULT_DISTRIBUTIONS, DISTRIBUTION_LABELS } from "../types";

type DistributionInputProps = {
  value: Distribution;
  onChange: (distribution: Distribution) => void;
  label?: string;
  showPercentage?: boolean; // For growth rates, show as percentage
};

const inputClass =
  "flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800";

type FieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: string;
  min?: number;
  max?: number;
  id: string;
};

function Field({
  label,
  value,
  onChange,
  suffix,
  step,
  min,
  max,
  id,
}: FieldProps) {
  return (
    <div className="flex gap-2 items-center">
      <label htmlFor={id} className="text-xs text-gray-500 w-16">
        {label}
      </label>
      <input
        id={id}
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputClass}
      />
      {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
    </div>
  );
}

export function DistributionInput({
  value,
  onChange,
  label,
  showPercentage = false,
}: DistributionInputProps) {
  const baseId = useId();
  const multiplier = showPercentage ? 100 : 1;
  const suffix = showPercentage ? "%" : "";

  const handleTypeChange = (newType: DistributionType) => {
    if (newType === value.type) return;

    const defaultDist = DEFAULT_DISTRIBUTIONS[newType];

    if (newType === "fixed" && value.type === "normal") {
      onChange({ type: "fixed", value: value.mean });
    } else if (newType === "normal" && value.type === "fixed") {
      onChange({
        type: "normal",
        mean: value.value,
        stdDev: value.value * 0.1,
      });
    } else {
      onChange({ ...defaultDist });
    }
  };

  const renderFields = () => {
    switch (value.type) {
      case "fixed":
        return (
          <Field
            id={`${baseId}-value`}
            label="Value"
            value={value.value * multiplier}
            onChange={(v) => onChange({ ...value, value: v / multiplier })}
            suffix={suffix}
          />
        );

      case "normal":
        return (
          <div className="space-y-2">
            <Field
              id={`${baseId}-mean`}
              label="Mean"
              value={value.mean * multiplier}
              onChange={(v) => onChange({ ...value, mean: v / multiplier })}
              suffix={suffix}
            />
            <Field
              id={`${baseId}-stddev`}
              label="Std Dev"
              value={value.stdDev * multiplier}
              onChange={(v) => onChange({ ...value, stdDev: v / multiplier })}
              suffix={suffix}
            />
          </div>
        );

      case "uniform":
        return (
          <div className="space-y-2">
            <Field
              id={`${baseId}-min`}
              label="Min"
              value={value.min * multiplier}
              onChange={(v) => onChange({ ...value, min: v / multiplier })}
              suffix={suffix}
            />
            <Field
              id={`${baseId}-max`}
              label="Max"
              value={value.max * multiplier}
              onChange={(v) => onChange({ ...value, max: v / multiplier })}
              suffix={suffix}
            />
          </div>
        );

      case "triangular":
        return (
          <div className="space-y-2">
            <Field
              id={`${baseId}-min`}
              label="Min"
              value={value.min * multiplier}
              onChange={(v) => onChange({ ...value, min: v / multiplier })}
              suffix={suffix}
            />
            <Field
              id={`${baseId}-mode`}
              label="Mode"
              value={value.mode * multiplier}
              onChange={(v) => onChange({ ...value, mode: v / multiplier })}
              suffix={suffix}
            />
            <Field
              id={`${baseId}-max`}
              label="Max"
              value={value.max * multiplier}
              onChange={(v) => onChange({ ...value, max: v / multiplier })}
              suffix={suffix}
            />
          </div>
        );

      case "lognormal":
        return (
          <div className="space-y-2">
            <Field
              id={`${baseId}-mu`}
              label="μ (mu)"
              value={value.mu}
              onChange={(v) => onChange({ ...value, mu: v })}
              step="0.1"
            />
            <Field
              id={`${baseId}-sigma`}
              label="σ (sigma)"
              value={value.sigma}
              onChange={(v) => onChange({ ...value, sigma: v })}
              step="0.1"
              min={0}
            />
            <p className="text-xs text-gray-400">
              Mean ≈{" "}
              {Math.exp(value.mu + (value.sigma * value.sigma) / 2).toFixed(2)}
            </p>
          </div>
        );

      case "binary":
        return (
          <div className="space-y-2">
            <Field
              id={`${baseId}-prob`}
              label="Prob."
              value={value.probability * 100}
              onChange={(v) => onChange({ ...value, probability: v / 100 })}
              suffix="%"
              min={0}
              max={100}
            />
            <Field
              id={`${baseId}-iftrue`}
              label="If True"
              value={value.valueIfTrue * multiplier}
              onChange={(v) =>
                onChange({ ...value, valueIfTrue: v / multiplier })
              }
              suffix={suffix}
            />
            <Field
              id={`${baseId}-iffalse`}
              label="If False"
              value={value.valueIfFalse * multiplier}
              onChange={(v) =>
                onChange({ ...value, valueIfFalse: v / multiplier })
              }
              suffix={suffix}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const selectId = `${baseId}-type`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value.type}
        onChange={(e) => handleTypeChange(e.target.value as DistributionType)}
        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
      >
        {Object.entries(DISTRIBUTION_LABELS).map(([type, typeLabel]) => (
          <option key={type} value={type}>
            {typeLabel}
          </option>
        ))}
      </select>
      <div className="pl-2 border-l-2 border-gray-200 dark:border-gray-700">
        {renderFields()}
      </div>
    </div>
  );
}

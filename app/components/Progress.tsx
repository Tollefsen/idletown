import type { HTMLAttributes } from "react";
import { progressColors, progressSizes } from "../config/theme";

type ProgressSize = keyof typeof progressSizes;
type ProgressColor = keyof typeof progressColors;

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: ProgressSize;
  color?: ProgressColor;
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  size = "md",
  color = "primary",
  showLabel = false,
  className = "",
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const sizeClasses = progressSizes[size];
  const colorClasses = progressColors[color];

  return (
    <div className={`w-full ${className}`} {...props}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses}`}
      >
        <div
          className={`${colorClasses} ${sizeClasses} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

import type { HTMLAttributes } from "react";
import { spinnerSizes } from "../config/theme";

type SpinnerSize = keyof typeof spinnerSizes;

interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
}

export function Spinner({
  size = "md",
  className = "",
  ...props
}: SpinnerProps) {
  const sizeClasses = spinnerSizes[size];

  return (
    <span
      aria-busy="true"
      aria-live="polite"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600 dark:text-blue-400 ${sizeClasses} ${className}`}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </span>
  );
}

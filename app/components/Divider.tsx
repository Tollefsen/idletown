import type { HTMLAttributes } from "react";

type Orientation = "horizontal" | "vertical";

interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: Orientation;
}

export function Divider({
  orientation = "horizontal",
  className = "",
  ...props
}: DividerProps) {
  const orientationClasses =
    orientation === "horizontal"
      ? "w-full border-t border-l-0"
      : "h-full border-l border-t-0 self-stretch";

  return (
    <hr
      aria-orientation={orientation}
      className={`border-gray-200 dark:border-gray-700 ${orientationClasses} ${className}`}
      {...props}
    />
  );
}

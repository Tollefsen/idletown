import type { HTMLAttributes, ReactNode } from "react";
import { gapSizes } from "../config/theme";

type GapSize = keyof typeof gapSizes;
type Direction = "horizontal" | "vertical";
type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: Direction;
  gap?: GapSize;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  children: ReactNode;
}

const alignClasses: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyClasses: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

export function Stack({
  direction = "vertical",
  gap = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  className = "",
  children,
  ...props
}: StackProps) {
  const directionClasses = direction === "horizontal" ? "flex-row" : "flex-col";
  const gapClasses = gapSizes[gap];
  const alignClass = alignClasses[align];
  const justifyClass = justifyClasses[justify];
  const wrapClass = wrap ? "flex-wrap" : "";

  return (
    <div
      className={`flex ${directionClasses} ${gapClasses} ${alignClass} ${justifyClass} ${wrapClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

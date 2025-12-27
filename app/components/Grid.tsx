import type { HTMLAttributes, ReactNode } from "react";
import { gapSizes } from "../config/theme";

type GapSize = keyof typeof gapSizes;
type Cols = 1 | 2 | 3 | 4 | 5 | 6 | 12;

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: Cols;
  colsSm?: Cols;
  colsMd?: Cols;
  colsLg?: Cols;
  gap?: GapSize;
  children: ReactNode;
}

const colClasses: Record<Cols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

const colSmClasses: Record<Cols, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
};

const colMdClasses: Record<Cols, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
};

const colLgClasses: Record<Cols, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
};

export function Grid({
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  gap = "md",
  className = "",
  children,
  ...props
}: GridProps) {
  const baseColClasses = colClasses[cols];
  const smClasses = colsSm ? colSmClasses[colsSm] : "";
  const mdClasses = colsMd ? colMdClasses[colsMd] : "";
  const lgClasses = colsLg ? colLgClasses[colsLg] : "";
  const gapClasses = gapSizes[gap];

  return (
    <div
      className={`grid ${baseColClasses} ${smClasses} ${mdClasses} ${lgClasses} ${gapClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

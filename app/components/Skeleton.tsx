import type { HTMLAttributes } from "react";

type SkeletonVariant = "text" | "circular" | "rectangular";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const defaultSizes = {
    text: { width: "100%", height: undefined },
    circular: { width: "40px", height: "40px" },
    rectangular: { width: "100%", height: "100px" },
  };

  const computedWidth = width ?? defaultSizes[variant].width;
  const computedHeight = height ?? defaultSizes[variant].height;

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variantClasses[variant]} ${className}`}
      style={{
        width:
          typeof computedWidth === "number"
            ? `${computedWidth}px`
            : computedWidth,
        height:
          typeof computedHeight === "number"
            ? `${computedHeight}px`
            : computedHeight,
        ...style,
      }}
      {...props}
    />
  );
}

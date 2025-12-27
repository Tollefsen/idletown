import type { HTMLAttributes, ReactNode } from "react";
import { badgeSizes, badgeVariants } from "../config/theme";

type BadgeVariant = keyof typeof badgeVariants;
type BadgeSize = keyof typeof badgeSizes;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const variantClasses = badgeVariants[variant];
  const sizeClasses = badgeSizes[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

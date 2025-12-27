import type { HTMLAttributes, ReactNode } from "react";
import { cardPadding, cardVariants } from "../config/theme";

type CardVariant = keyof typeof cardVariants;
type CardPadding = keyof typeof cardPadding;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
}

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  const variantClasses = cardVariants[variant];
  const paddingClasses = cardPadding[padding];

  return (
    <div
      className={`rounded-lg ${variantClasses} ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

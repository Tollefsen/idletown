import type { HTMLAttributes, ReactNode } from "react";
import { textColors, textSizes } from "../config/theme";

type TextSize = keyof typeof textSizes;
type TextColor = keyof typeof textColors;
type TextElement = "p" | "span" | "div";

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  size?: TextSize;
  color?: TextColor;
  children: ReactNode;
}

export function Text({
  as = "p",
  size = "base",
  color = "default",
  className = "",
  children,
  ...props
}: TextProps) {
  const Tag = as;
  const sizeClasses = textSizes[size];
  const colorClasses = textColors[color];

  return (
    <Tag className={`${sizeClasses} ${colorClasses} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

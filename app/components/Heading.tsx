import type { HTMLAttributes, ReactNode } from "react";
import { headingSizes } from "../config/theme";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: HeadingLevel;
  children: ReactNode;
}

export function Heading({
  as = "h2",
  size,
  className = "",
  children,
  ...props
}: HeadingProps) {
  const Tag = as;
  const sizeClasses = headingSizes[size ?? as];

  return (
    <Tag
      className={`text-gray-900 dark:text-gray-100 ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

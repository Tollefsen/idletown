import type { HTMLAttributes, ReactNode } from "react";
import { containerSizes } from "../config/theme";

type ContainerSize = keyof typeof containerSizes;

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  centered?: boolean;
  children: ReactNode;
}

export function Container({
  size = "lg",
  centered = true,
  className = "",
  children,
  ...props
}: ContainerProps) {
  const sizeClasses = containerSizes[size];
  const centerClasses = centered ? "mx-auto" : "";

  return (
    <div
      className={`w-full px-4 ${sizeClasses} ${centerClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

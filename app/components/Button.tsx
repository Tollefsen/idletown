import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonSizes, buttonVariants } from "../config/theme";

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses = "font-medium transition-colors rounded-lg";
  const variantClasses = buttonVariants[variant];
  const sizeClasses = buttonSizes[size];
  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "font-medium transition-colors rounded-full border border-solid flex items-center justify-center";
  const variantClasses = buttonVariants[variant];
  const sizeClasses = size === "lg" ? "h-12 px-6" : "h-10 px-5";
  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

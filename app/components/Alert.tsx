import type { HTMLAttributes, ReactNode } from "react";
import { alertVariants } from "../config/theme";

type AlertVariant = keyof typeof alertVariants;

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
  children: ReactNode;
}

export function Alert({
  variant = "info",
  title,
  onClose,
  className = "",
  children,
  ...props
}: AlertProps) {
  const variantClasses = alertVariants[variant];

  return (
    <div
      role="alert"
      className={`border rounded-lg p-4 ${variantClasses} ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close alert"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "../config/constants";

interface BackLinkProps {
  href?: string;
  children?: ReactNode;
  className?: string;
}

export function BackLink({
  href = ROUTES.home,
  children = "← Back to Idle Town",
  className = "",
}: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`text-sm text-gray-600 dark:text-gray-400 hover:underline mb-2 inline-block ${className}`}
    >
      {children}
    </Link>
  );
}

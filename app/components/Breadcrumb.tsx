import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

interface BreadcrumbItem {
  id: string;
  label: ReactNode;
  href?: string;
}

interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

export function Breadcrumb({
  items,
  separator = "/",
  className = "",
  ...props
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className} {...props}>
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-2">
            {index > 0 && (
              <span
                aria-hidden="true"
                className="text-gray-400 dark:text-gray-500"
              >
                {separator}
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

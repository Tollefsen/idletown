import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Year of Vibe",
  description: "Personal dashboard tracking 52 projects in 2026",
  openGraph: {
    title: "Year of Vibe",
    description: "Personal dashboard tracking 52 projects in 2026",
  },
};

export default function YearOfVibeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

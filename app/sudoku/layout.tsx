import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sudoku Difficulty Analyzer",
  description:
    "Analyze Sudoku puzzle difficulty based on the solving techniques required. Supports techniques from basic singles to advanced chains.",
  openGraph: {
    title: "Sudoku Difficulty Analyzer | Idle Town",
    description:
      "Enter a Sudoku puzzle to discover its true difficulty level based on the techniques needed to solve it.",
  },
};

export default function SudokuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

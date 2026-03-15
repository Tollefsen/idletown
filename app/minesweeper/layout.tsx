import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minefield",
  description:
    "Navigate a character through a minefield. Reveal safe tiles, flag mines, and clear the field to win.",
  openGraph: {
    title: "Minefield | Idle Town",
    description:
      "A minesweeper twist — control a character walking through the minefield instead of clicking tiles.",
  },
};

export default function MinesweeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

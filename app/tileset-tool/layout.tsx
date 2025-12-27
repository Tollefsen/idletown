import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tileset Tool | Idle Town",
  description:
    "Create pixel art tiles, combine them into tilesets with adjacency rules, and test them in a level editor with Wave Function Collapse.",
};

export default function TilesetToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

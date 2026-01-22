import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Map Generator",
  description:
    "Procedural world generation with fractal noise terrain, climate-based biomes, rivers, and fantasy/alien biome options.",
  openGraph: {
    title: "World Map Generator | Idle Town",
    description:
      "Procedural world generation with fractal noise terrain, climate-based biomes, rivers, and fantasy/alien biome options.",
  },
};

export default function MapgenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

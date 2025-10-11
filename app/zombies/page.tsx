import type { Metadata } from "next";
import { ZombiesGame } from "./game";

export const metadata: Metadata = {
  title: "Zombies Game",
  description:
    "A 2D survival zombie shooter game. Survive waves of zombies and rack up your score.",
  openGraph: {
    title: "Zombies Game | Idle Town",
    description:
      "A 2D survival zombie shooter game. Survive waves of zombies and rack up your score.",
  },
};

export default function ZombiesPage() {
  return <ZombiesGame />;
}

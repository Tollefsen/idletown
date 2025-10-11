import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coin Flipper",
  description:
    "A simple coin flipper. See how many heads in a row you can get!",
  openGraph: {
    title: "Coin Flipper | Idle Town",
    description:
      "A simple coin flipper. See how many heads in a row you can get!",
  },
};

export default function CoinFlipperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

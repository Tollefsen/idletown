import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cash Flow Monte Carlo",
  description:
    "Predict your financial future with Monte Carlo simulation. Define income, expenses, and investments as probability distributions and visualize confidence bands.",
  openGraph: {
    title: "Cash Flow Monte Carlo | Idle Town",
    description:
      "Predict your financial future with Monte Carlo simulation. Visualize confidence bands for your cash flow projections.",
  },
};

export default function CashFlowMonteCarloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

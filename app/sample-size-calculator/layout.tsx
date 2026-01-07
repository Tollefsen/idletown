import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sample Size Calculator",
  description:
    "Calculate the required sample size for A/B tests. Determine how many visitors you need for statistically significant results.",
  openGraph: {
    title: "Sample Size Calculator | Idle Town",
    description:
      "Calculate the required sample size for A/B tests with configurable significance levels and power.",
  },
};

export default function SampleSizeCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

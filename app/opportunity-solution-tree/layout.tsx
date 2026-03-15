import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opportunity Solution Tree",
  description:
    "Visual tool for mapping outcomes, opportunities, solutions, and experiments using Teresa Torres' OST framework.",
  openGraph: {
    title: "Opportunity Solution Tree | Idle Town",
    description:
      "Visual product discovery tool for mapping outcomes to experiments.",
  },
};

export default function OstLayout({ children }: { children: React.ReactNode }) {
  return children;
}

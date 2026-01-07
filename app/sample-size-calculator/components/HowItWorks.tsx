"use client";

import { useState } from "react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({
  title,
  children,
  isOpen,
  onToggle,
}: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-1 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 px-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export function HowItWorks() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenItems(
      new Set(["significance", "power", "mde", "formula", "tails", "tips"]),
    );
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Learn about the concepts
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Expand all
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg px-3">
        <AccordionItem
          title="What is Statistical Significance (α)?"
          isOpen={openItems.has("significance")}
          onToggle={() => toggleItem("significance")}
        >
          <p className="mb-2">
            <strong>Statistical significance</strong> (alpha, α) is the
            probability of detecting an effect when there is none - a "false
            positive" or Type I error.
          </p>
          <p className="mb-2">
            When you set significance to 95%, you're saying there's only a 5%
            chance (α = 0.05) that your results are due to random chance rather
            than a real effect.
          </p>
          <p>
            <strong>Common values:</strong> 95% (α = 0.05) is standard for most
            A/B tests. Use 99% for high-stakes decisions where false positives
            are costly.
          </p>
        </AccordionItem>

        <AccordionItem
          title="What is Statistical Power (1 - β)?"
          isOpen={openItems.has("power")}
          onToggle={() => toggleItem("power")}
        >
          <p className="mb-2">
            <strong>Statistical power</strong> is the probability of detecting a
            real effect when one exists. A power of 80% means you have an 80%
            chance of finding a true difference.
          </p>
          <p className="mb-2">
            The complement (β) is the probability of a "false negative" or Type
            II error - missing a real effect. With 80% power, β = 20%.
          </p>
          <p>
            <strong>Common values:</strong> 80% is typical for A/B tests. Use
            90% when the cost of missing a real improvement is high.
          </p>
        </AccordionItem>

        <AccordionItem
          title="What is Minimum Detectable Effect (MDE)?"
          isOpen={openItems.has("mde")}
          onToggle={() => toggleItem("mde")}
        >
          <p className="mb-2">
            <strong>MDE</strong> is the smallest relative improvement you want
            to be able to detect. It's expressed as a percentage of your
            baseline rate.
          </p>
          <p className="mb-2">
            For example, if your baseline conversion is 5% and MDE is 10%,
            you're testing whether the new variant achieves at least 5.5% (a 10%
            relative lift).
          </p>
          <p className="mb-2">
            <strong>Trade-off:</strong> Smaller MDEs require much larger sample
            sizes. A 5% MDE needs roughly 4x the sample of a 10% MDE.
          </p>
          <p>
            <strong>Tip:</strong> Choose the smallest effect that would be worth
            implementing. Don't aim for tiny effects if they wouldn't justify
            the development effort.
          </p>
        </AccordionItem>

        <AccordionItem
          title="The Sample Size Formula"
          isOpen={openItems.has("formula")}
          onToggle={() => toggleItem("formula")}
        >
          <p className="mb-2">
            The sample size per variation is calculated using this formula:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 font-mono text-xs mb-3 overflow-x-auto">
            n = 2 × [(Z<sub>α</sub> + Z<sub>β</sub>)² × p × (1 - p)] / δ²
          </div>
          <p className="mb-2">Where:</p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li>
              <strong>
                Z<sub>α</sub>
              </strong>{" "}
              = Z-score for significance level (1.96 for 95%)
            </li>
            <li>
              <strong>
                Z<sub>β</sub>
              </strong>{" "}
              = Z-score for power (0.84 for 80%)
            </li>
            <li>
              <strong>p</strong> = baseline conversion rate
            </li>
            <li>
              <strong>δ</strong> = absolute effect size (baseline × MDE)
            </li>
          </ul>
          <p>
            For multiple variations, we apply{" "}
            <strong>Bonferroni correction</strong> to adjust the significance
            level and control for multiple comparisons.
          </p>
        </AccordionItem>

        <AccordionItem
          title="One-tailed vs Two-tailed Tests"
          isOpen={openItems.has("tails")}
          onToggle={() => toggleItem("tails")}
        >
          <p className="mb-2">
            <strong>Two-tailed tests</strong> detect effects in either direction
            - the variant could be better OR worse than control. This is the
            safer, recommended choice.
          </p>
          <p className="mb-2">
            <strong>One-tailed tests</strong> only detect effects in one
            direction (usually improvement). They require smaller samples but
            assume you'll ignore negative results.
          </p>
          <p>
            <strong>Recommendation:</strong> Use two-tailed unless you have a
            strong reason not to. You should care if a change hurts performance,
            not just if it helps.
          </p>
        </AccordionItem>

        <AccordionItem
          title="Tips for Running A/B Tests"
          isOpen={openItems.has("tips")}
          onToggle={() => toggleItem("tips")}
        >
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Don't peek:</strong> Decide your sample size upfront and
              stick to it. Checking results early inflates false positive rates.
            </li>
            <li>
              <strong>Run for full weeks:</strong> User behavior varies by day.
              Run tests for at least 1-2 complete weeks to capture weekly
              patterns.
            </li>
            <li>
              <strong>One change at a time:</strong> Test a single hypothesis
              per experiment to clearly attribute any effect.
            </li>
            <li>
              <strong>Document everything:</strong> Record start/end dates,
              sample sizes, and any external factors that might affect results.
            </li>
            <li>
              <strong>Consider practical significance:</strong> A statistically
              significant 0.1% improvement may not be worth the engineering
              effort to implement.
            </li>
            <li>
              <strong>Account for seasonality:</strong> Be aware of holidays,
              marketing campaigns, or other events that could skew results.
            </li>
          </ul>
        </AccordionItem>
      </div>
    </div>
  );
}

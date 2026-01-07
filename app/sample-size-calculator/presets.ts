import type { PresetScenario } from "./types";

/**
 * Pre-configured scenarios for common A/B testing use cases
 */
export const PRESETS: PresetScenario[] = [
  {
    id: "ecommerce-checkout",
    name: "E-commerce Checkout",
    description:
      "Typical checkout funnel optimization with low baseline conversion",
    params: {
      baselineRate: 0.03,
      mde: 0.05,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
    },
  },
  {
    id: "email-signup",
    name: "Email Signup",
    description: "Newsletter or lead capture form optimization",
    params: {
      baselineRate: 0.1,
      mde: 0.1,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
    },
  },
  {
    id: "saas-trial",
    name: "SaaS Trial Conversion",
    description: "Free trial to paid subscription conversion",
    params: {
      baselineRate: 0.02,
      mde: 0.2,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
    },
  },
  {
    id: "cta-button",
    name: "CTA Button Click",
    description: "Call-to-action button click rate optimization",
    params: {
      baselineRate: 0.05,
      mde: 0.15,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
    },
  },
  {
    id: "landing-page",
    name: "Landing Page",
    description: "Landing page lead generation or signup",
    params: {
      baselineRate: 0.08,
      mde: 0.1,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
    },
  },
  {
    id: "mobile-app-install",
    name: "Mobile App Install",
    description: "App store page or ad to install conversion",
    params: {
      baselineRate: 0.04,
      mde: 0.15,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
    },
  },
];

/**
 * Default parameters for new scenarios
 */
export const DEFAULT_PARAMS = {
  baselineRate: 0.05,
  mde: 0.1,
  significanceLevel: 0.95,
  power: 0.8,
  tails: "two" as const,
  variations: 2,
};

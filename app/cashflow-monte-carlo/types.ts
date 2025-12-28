// Distribution types - all possible probability distributions
export type FixedDistribution = { type: "fixed"; value: number };
export type NormalDistribution = {
  type: "normal";
  mean: number;
  stdDev: number;
};
export type UniformDistribution = { type: "uniform"; min: number; max: number };
export type TriangularDistribution = {
  type: "triangular";
  min: number;
  mode: number;
  max: number;
};
export type LognormalDistribution = {
  type: "lognormal";
  mu: number;
  sigma: number;
};
export type BinaryDistribution = {
  type: "binary";
  probability: number; // 0-1
  valueIfTrue: number;
  valueIfFalse: number;
};

export type Distribution =
  | FixedDistribution
  | NormalDistribution
  | UniformDistribution
  | TriangularDistribution
  | LognormalDistribution
  | BinaryDistribution;

export type DistributionType = Distribution["type"];

export type ParameterCategory =
  | "income"
  | "expense"
  | "investment"
  | "one-time";
export type Frequency = "monthly" | "yearly" | "one-time";

export type CashFlowParameter = {
  id: string;
  name: string;
  category: ParameterCategory;
  amount: Distribution;
  growthRate: Distribution; // Annual % growth (as decimal, e.g., 0.03 = 3%)
  frequency: Frequency;
  startMonth?: number; // 0-indexed, optional
  endMonth?: number; // 0-indexed, optional
  // For investments only:
  returnRate?: Distribution; // Annual % return (as decimal)
};

export type SimulationConfig = {
  initialBalance: Distribution;
  timeHorizonMonths: number;
  iterations: number;
  inflationRate: Distribution; // Annual % (as decimal)
  currency: string; // e.g., 'USD', 'NOK', 'EUR'
};

export type Scenario = {
  id: string;
  name: string;
  parameters: CashFlowParameter[];
  config: SimulationConfig;
  createdAt: string;
  updatedAt: string;
};

// Simulation results
export type MonthlyStats = {
  month: number;
  p5: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  mean: number;
};

export type SimulationResult = {
  monthlyStats: MonthlyStats[];
  finalBalanceDistribution: number[]; // Raw values for histogram
  probabilityPositive: number; // % chance balance > 0 at end
  probabilityGoal?: number; // Optional goal probability
  runTimeMs: number;
};

// For Web Worker communication
export type SimulationProgress = {
  completed: number;
  total: number;
  percentage: number;
};

export type WorkerMessage =
  | { type: "progress"; data: SimulationProgress }
  | { type: "result"; data: SimulationResult }
  | { type: "error"; data: string };

export type WorkerInput = {
  scenario: Scenario;
  goalAmount?: number;
};

// Default distributions for new parameters
export const DEFAULT_DISTRIBUTIONS: Record<DistributionType, Distribution> = {
  fixed: { type: "fixed", value: 0 },
  normal: { type: "normal", mean: 0, stdDev: 100 },
  uniform: { type: "uniform", min: 0, max: 100 },
  triangular: { type: "triangular", min: 0, mode: 50, max: 100 },
  lognormal: { type: "lognormal", mu: 0, sigma: 0.5 },
  binary: {
    type: "binary",
    probability: 0.5,
    valueIfTrue: 100,
    valueIfFalse: 0,
  },
};

export const DISTRIBUTION_LABELS: Record<DistributionType, string> = {
  fixed: "Fixed Value",
  normal: "Normal (Gaussian)",
  uniform: "Uniform",
  triangular: "Triangular",
  lognormal: "Log-normal",
  binary: "Binary (On/Off)",
};

export const CATEGORY_LABELS: Record<ParameterCategory, string> = {
  income: "Income",
  expense: "Expenses",
  investment: "Investments",
  "one-time": "One-time Events",
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  "one-time": "One-time",
};

/**
 * Parameters for sample size calculation
 */
export interface SampleSizeParams {
  /** Baseline conversion rate (0-1, e.g., 0.05 for 5%) */
  baselineRate: number;
  /** Minimum detectable effect as relative change (0-1, e.g., 0.10 for 10% lift) */
  mde: number;
  /** Statistical significance level (0.80, 0.90, 0.95, 0.99) */
  significanceLevel: number;
  /** Statistical power (0.70, 0.80, 0.90, 0.95) */
  power: number;
  /** One-tailed or two-tailed test */
  tails: "one" | "two";
  /** Number of variations including control (2-5) */
  variations: number;
}

/**
 * Result of sample size calculation
 */
export interface CalculationResult {
  /** Required sample size per variation */
  sampleSizePerVariation: number;
  /** Total sample size across all variations */
  totalSampleSize: number;
  /** Absolute change in conversion rate (e.g., 0.005 for 0.5 percentage points) */
  absoluteEffect: number;
  /** Expected new conversion rate after improvement */
  newRate: number;
}

/**
 * Data point for the sample size chart
 */
export interface ChartDataPoint {
  /** Minimum detectable effect (relative, 0-1) */
  mde: number;
  /** MDE as percentage for display */
  mdePercent: number;
  /** Required sample size per variation */
  sampleSize: number;
}

/**
 * Parameters for generating chart data
 */
export interface ChartParams {
  /** Baseline conversion rate */
  baselineRate: number;
  /** Statistical significance level */
  significanceLevel: number;
  /** Statistical power */
  power: number;
  /** One-tailed or two-tailed test */
  tails: "one" | "two";
  /** Number of variations */
  variations: number;
  /** Minimum MDE for chart range (default 0.01) */
  mdeMin?: number;
  /** Maximum MDE for chart range (default 0.50) */
  mdeMax?: number;
  /** Number of data points (default 50) */
  points?: number;
}

/**
 * A saved scenario configuration
 */
export interface Scenario {
  /** Unique identifier */
  id: string;
  /** User-friendly name */
  name: string;
  /** Optional description */
  description?: string;
  /** Calculation parameters */
  params: SampleSizeParams;
  /** Daily traffic for duration estimate (optional) */
  dailyTraffic?: number;
  /** Percentage of traffic allocated to test (0-1, optional) */
  trafficAllocation?: number;
  /** ISO timestamp when created */
  createdAt: string;
  /** ISO timestamp when last modified */
  updatedAt: string;
}

/**
 * Duration estimate result
 */
export interface DurationEstimate {
  /** Number of days to reach required sample size */
  days: number;
  /** Estimated completion date */
  completionDate: Date;
  /** Daily visitors allocated to test */
  dailyTestTraffic: number;
}

/**
 * Preset scenario (without timestamps and ID)
 */
export interface PresetScenario {
  /** Preset identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of use case */
  description: string;
  /** Default parameters */
  params: SampleSizeParams;
}

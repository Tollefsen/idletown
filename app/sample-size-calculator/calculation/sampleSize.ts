import type {
  CalculationResult,
  ChartDataPoint,
  ChartParams,
  DurationEstimate,
  SampleSizeParams,
} from "../types";

/**
 * Z-scores for common significance levels (two-tailed)
 * For one-tailed tests, we use the full alpha rather than alpha/2
 */
const Z_SCORES_TWO_TAILED: Record<number, number> = {
  0.8: 1.282,
  0.9: 1.645,
  0.95: 1.96,
  0.99: 2.576,
};

const Z_SCORES_ONE_TAILED: Record<number, number> = {
  0.8: 0.842,
  0.9: 1.282,
  0.95: 1.645,
  0.99: 2.326,
};

/**
 * Z-scores for statistical power (1 - beta)
 */
const POWER_Z_SCORES: Record<number, number> = {
  0.7: 0.524,
  0.8: 0.842,
  0.9: 1.282,
  0.95: 1.645,
};

/**
 * Get Z-score for a given significance level
 */
export function getSignificanceZScore(
  level: number,
  tails: "one" | "two",
): number {
  const scores = tails === "two" ? Z_SCORES_TWO_TAILED : Z_SCORES_ONE_TAILED;
  const zScore = scores[level];
  if (zScore === undefined) {
    throw new Error(
      `Unsupported significance level: ${level}. Use 0.8, 0.9, 0.95, or 0.99`,
    );
  }
  return zScore;
}

/**
 * Get Z-score for a given power level
 */
export function getPowerZScore(power: number): number {
  const zScore = POWER_Z_SCORES[power];
  if (zScore === undefined) {
    throw new Error(
      `Unsupported power level: ${power}. Use 0.7, 0.8, 0.9, or 0.95`,
    );
  }
  return zScore;
}

/**
 * Calculate the required sample size per variation for an A/B test.
 *
 * Uses the formula for comparing two proportions:
 * n = 2 * ((Z_α + Z_β)² * p̄(1-p̄)) / (p₁ - p₂)²
 *
 * For multiple variations, applies Bonferroni correction.
 */
export function calculateSampleSize(
  params: SampleSizeParams,
): CalculationResult {
  const { baselineRate, mde, significanceLevel, power, tails, variations } =
    params;

  // Validate inputs
  if (baselineRate <= 0 || baselineRate >= 1) {
    throw new Error("Baseline rate must be between 0 and 1 (exclusive)");
  }
  if (mde <= 0 || mde >= 1) {
    throw new Error("MDE must be between 0 and 1 (exclusive)");
  }
  if (variations < 2 || variations > 10) {
    throw new Error("Variations must be between 2 and 10");
  }

  // Calculate absolute effect
  const absoluteEffect = baselineRate * mde;
  const newRate = baselineRate + absoluteEffect;

  // Validate that new rate is valid
  if (newRate >= 1) {
    throw new Error(
      "The combination of baseline rate and MDE results in a rate >= 100%",
    );
  }

  // Apply Bonferroni correction for multiple comparisons
  // When comparing control to k-1 variants, we need to adjust alpha
  const numComparisons = variations - 1;
  const adjustedAlpha = (1 - significanceLevel) / numComparisons;

  // Get Z-scores
  // For Bonferroni-adjusted significance, we need to interpolate or use closest value
  // For simplicity, we'll use the adjusted alpha directly in the calculation
  const zAlpha =
    tails === "two"
      ? normalQuantile(1 - adjustedAlpha / 2)
      : normalQuantile(1 - adjustedAlpha);
  const zBeta = getPowerZScore(power);

  // Pooled proportion
  const pooledRate = (baselineRate + newRate) / 2;

  // Calculate sample size using the formula
  // n = 2 * ((Z_α + Z_β)² * p̄(1-p̄)) / (p₁ - p₂)²
  const numerator = 2 * (zAlpha + zBeta) ** 2 * pooledRate * (1 - pooledRate);
  const denominator = absoluteEffect ** 2;

  const sampleSizePerVariation = Math.ceil(numerator / denominator);
  const totalSampleSize = sampleSizePerVariation * variations;

  return {
    sampleSizePerVariation,
    totalSampleSize,
    absoluteEffect,
    newRate,
  };
}

/**
 * Calculate sample size for a specific MDE (used for chart generation)
 * Returns the raw sample size without creating a full result object
 */
export function calculateSampleSizeForMde(
  baselineRate: number,
  mde: number,
  significanceLevel: number,
  power: number,
  tails: "one" | "two",
  variations: number,
): number {
  const absoluteEffect = baselineRate * mde;
  const newRate = baselineRate + absoluteEffect;

  if (newRate >= 1) {
    return Number.POSITIVE_INFINITY;
  }

  const numComparisons = variations - 1;
  const adjustedAlpha = (1 - significanceLevel) / numComparisons;

  const zAlpha =
    tails === "two"
      ? normalQuantile(1 - adjustedAlpha / 2)
      : normalQuantile(1 - adjustedAlpha);
  const zBeta = getPowerZScore(power);

  const pooledRate = (baselineRate + newRate) / 2;
  const numerator = 2 * (zAlpha + zBeta) ** 2 * pooledRate * (1 - pooledRate);
  const denominator = absoluteEffect ** 2;

  return Math.ceil(numerator / denominator);
}

/**
 * Generate data points for the sample size chart
 */
export function generateChartData(params: ChartParams): ChartDataPoint[] {
  const {
    baselineRate,
    significanceLevel,
    power,
    tails,
    variations,
    mdeMin = 0.01,
    mdeMax = 0.5,
    points = 50,
  } = params;

  const dataPoints: ChartDataPoint[] = [];
  const step = (mdeMax - mdeMin) / (points - 1);

  for (let i = 0; i < points; i++) {
    const mde = mdeMin + i * step;
    const sampleSize = calculateSampleSizeForMde(
      baselineRate,
      mde,
      significanceLevel,
      power,
      tails,
      variations,
    );

    // Skip infinite values (when newRate >= 1)
    if (Number.isFinite(sampleSize)) {
      dataPoints.push({
        mde,
        mdePercent: Math.round(mde * 100),
        sampleSize,
      });
    }
  }

  return dataPoints;
}

/**
 * Calculate estimated duration to complete the test
 */
export function calculateDuration(
  sampleSizePerVariation: number,
  variations: number,
  dailyTraffic: number,
  trafficAllocation: number,
): DurationEstimate {
  const totalSampleSize = sampleSizePerVariation * variations;
  const dailyTestTraffic = dailyTraffic * trafficAllocation;

  if (dailyTestTraffic <= 0) {
    throw new Error("Daily test traffic must be greater than 0");
  }

  const days = Math.ceil(totalSampleSize / dailyTestTraffic);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + days);

  return {
    days,
    completionDate,
    dailyTestTraffic,
  };
}

/**
 * Approximate the inverse of the standard normal CDF (quantile function)
 * Uses the Abramowitz and Stegun approximation
 */
function normalQuantile(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error("Probability must be between 0 and 1 (exclusive)");
  }

  // Coefficients for the rational approximation
  const a1 = -3.969683028665376e1;
  const a2 = 2.209460984245205e2;
  const a3 = -2.759285104469687e2;
  const a4 = 1.38357751867269e2;
  const a5 = -3.066479806614716e1;
  const a6 = 2.506628277459239;

  const b1 = -5.447609879822406e1;
  const b2 = 1.615858368580409e2;
  const b3 = -1.556989798598866e2;
  const b4 = 6.680131188771972e1;
  const b5 = -1.328068155288572e1;

  const c1 = -7.784894002430293e-3;
  const c2 = -3.223964580411365e-1;
  const c3 = -2.400758277161838;
  const c4 = -2.549732539343734;
  const c5 = 4.374664141464968;
  const c6 = 2.938163982698783;

  const d1 = 7.784695709041462e-3;
  const d2 = 3.224671290700398e-1;
  const d3 = 2.445134137142996;
  const d4 = 3.754408661907416;

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number;
  let r: number;

  if (p < pLow) {
    // Lower region
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  }

  if (p <= pHigh) {
    // Central region
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    );
  }

  // Upper region
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
    ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
  );
}

/**
 * Available significance levels
 */
export const SIGNIFICANCE_LEVELS = [
  { value: 0.8, label: "80%" },
  { value: 0.9, label: "90%" },
  { value: 0.95, label: "95%" },
  { value: 0.99, label: "99%" },
] as const;

/**
 * Available power levels
 */
export const POWER_LEVELS = [
  { value: 0.7, label: "70%" },
  { value: 0.8, label: "80%" },
  { value: 0.9, label: "90%" },
  { value: 0.95, label: "95%" },
] as const;

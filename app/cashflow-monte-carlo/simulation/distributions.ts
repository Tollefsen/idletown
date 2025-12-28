import type { Distribution } from "../types";

/**
 * Box-Muller transform to generate normally distributed random numbers
 * Uses two uniform random numbers to produce two independent standard normal values
 */
function boxMullerNormal(): number {
  let u1 = 0;
  let u2 = 0;

  // Avoid log(0)
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Sample from a normal distribution
 */
export function sampleNormal(mean: number, stdDev: number): number {
  return mean + stdDev * boxMullerNormal();
}

/**
 * Sample from a uniform distribution
 */
export function sampleUniform(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Sample from a triangular distribution using inverse transform sampling
 */
export function sampleTriangular(
  min: number,
  mode: number,
  max: number,
): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);

  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

/**
 * Sample from a lognormal distribution
 * mu and sigma are the mean and stdDev of the underlying normal distribution
 */
export function sampleLognormal(mu: number, sigma: number): number {
  return Math.exp(sampleNormal(mu, sigma));
}

/**
 * Sample from a binary (Bernoulli-like) distribution
 */
export function sampleBinary(
  probability: number,
  valueIfTrue: number,
  valueIfFalse: number,
): number {
  return Math.random() < probability ? valueIfTrue : valueIfFalse;
}

/**
 * Sample from any distribution type
 */
export function sampleDistribution(dist: Distribution): number {
  switch (dist.type) {
    case "fixed":
      return dist.value;
    case "normal":
      return sampleNormal(dist.mean, dist.stdDev);
    case "uniform":
      return sampleUniform(dist.min, dist.max);
    case "triangular":
      return sampleTriangular(dist.min, dist.mode, dist.max);
    case "lognormal":
      return sampleLognormal(dist.mu, dist.sigma);
    case "binary":
      return sampleBinary(
        dist.probability,
        dist.valueIfTrue,
        dist.valueIfFalse,
      );
    default:
      throw new Error(
        `Unknown distribution type: ${(dist as Distribution).type}`,
      );
  }
}

/**
 * Get the expected mean of a distribution (for display purposes)
 */
export function getDistributionMean(dist: Distribution): number {
  switch (dist.type) {
    case "fixed":
      return dist.value;
    case "normal":
      return dist.mean;
    case "uniform":
      return (dist.min + dist.max) / 2;
    case "triangular":
      return (dist.min + dist.mode + dist.max) / 3;
    case "lognormal":
      // Mean of lognormal is exp(mu + sigma^2 / 2)
      return Math.exp(dist.mu + (dist.sigma * dist.sigma) / 2);
    case "binary":
      return (
        dist.probability * dist.valueIfTrue +
        (1 - dist.probability) * dist.valueIfFalse
      );
    default:
      return 0;
  }
}

/**
 * Get a human-readable description of a distribution
 */
export function getDistributionDescription(dist: Distribution): string {
  switch (dist.type) {
    case "fixed":
      return `${dist.value.toLocaleString()}`;
    case "normal":
      return `μ=${dist.mean.toLocaleString()}, σ=${dist.stdDev.toLocaleString()}`;
    case "uniform":
      return `${dist.min.toLocaleString()} - ${dist.max.toLocaleString()}`;
    case "triangular":
      return `${dist.min.toLocaleString()} / ${dist.mode.toLocaleString()} / ${dist.max.toLocaleString()}`;
    case "lognormal":
      return `μ=${dist.mu.toFixed(2)}, σ=${dist.sigma.toFixed(2)}`;
    case "binary":
      return `${(dist.probability * 100).toFixed(0)}% chance of ${dist.valueIfTrue.toLocaleString()}`;
    default:
      return "Unknown";
  }
}

/**
 * Convert lognormal parameters from "natural" mean/stdDev to mu/sigma
 * Useful for users who want to specify lognormal in terms of the actual mean
 */
export function lognormalFromMeanStdDev(
  mean: number,
  stdDev: number,
): { mu: number; sigma: number } {
  const variance = stdDev * stdDev;
  const mu = Math.log(mean / Math.sqrt(1 + variance / (mean * mean)));
  const sigma = Math.sqrt(Math.log(1 + variance / (mean * mean)));
  return { mu, sigma };
}

/**
 * Convert lognormal mu/sigma back to natural mean/stdDev
 */
export function lognormalToMeanStdDev(
  mu: number,
  sigma: number,
): { mean: number; stdDev: number } {
  const mean = Math.exp(mu + (sigma * sigma) / 2);
  const variance =
    (Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma);
  return { mean, stdDev: Math.sqrt(variance) };
}

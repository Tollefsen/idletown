import { describe, expect, it } from "vitest";
import {
  calculateDuration,
  calculateSampleSize,
  calculateSampleSizeForMde,
  generateChartData,
  getPowerZScore,
  getSignificanceZScore,
} from "./sampleSize";

describe("getSignificanceZScore", () => {
  it("returns correct Z-scores for two-tailed tests", () => {
    expect(getSignificanceZScore(0.95, "two")).toBe(1.96);
    expect(getSignificanceZScore(0.99, "two")).toBe(2.576);
    expect(getSignificanceZScore(0.9, "two")).toBe(1.645);
    expect(getSignificanceZScore(0.8, "two")).toBe(1.282);
  });

  it("returns correct Z-scores for one-tailed tests", () => {
    expect(getSignificanceZScore(0.95, "one")).toBe(1.645);
    expect(getSignificanceZScore(0.99, "one")).toBe(2.326);
  });

  it("throws for unsupported significance levels", () => {
    expect(() => getSignificanceZScore(0.85, "two")).toThrow(
      "Unsupported significance level",
    );
  });
});

describe("getPowerZScore", () => {
  it("returns correct Z-scores for power levels", () => {
    expect(getPowerZScore(0.8)).toBe(0.842);
    expect(getPowerZScore(0.9)).toBe(1.282);
    expect(getPowerZScore(0.95)).toBe(1.645);
    expect(getPowerZScore(0.7)).toBe(0.524);
  });

  it("throws for unsupported power levels", () => {
    expect(() => getPowerZScore(0.85)).toThrow("Unsupported power level");
  });
});

describe("calculateSampleSize", () => {
  it("calculates correct sample size for standard parameters", () => {
    // Baseline: 5%, MDE: 20% relative (5% -> 6%), 95% significance, 80% power
    const result = calculateSampleSize({
      baselineRate: 0.05,
      mde: 0.2,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
    });

    // Verify formula produces reasonable results
    // Sample size should be in thousands range for small effect sizes
    expect(result.sampleSizePerVariation).toBeGreaterThan(5000);
    expect(result.sampleSizePerVariation).toBeLessThan(15000);
    expect(result.absoluteEffect).toBeCloseTo(0.01, 5);
    expect(result.newRate).toBeCloseTo(0.06, 5);
  });

  it("calculates correct sample size for high baseline rate", () => {
    // Baseline: 30%, MDE: 10% relative (30% -> 33%)
    const result = calculateSampleSize({
      baselineRate: 0.3,
      mde: 0.1,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
    });

    // Higher baseline with small relative effect needs more samples
    expect(result.sampleSizePerVariation).toBeGreaterThan(2500);
    expect(result.sampleSizePerVariation).toBeLessThan(5000);
    expect(result.absoluteEffect).toBeCloseTo(0.03, 5);
    expect(result.newRate).toBeCloseTo(0.33, 5);
  });

  it("returns smaller sample size for one-tailed tests", () => {
    const params = {
      baselineRate: 0.05,
      mde: 0.2,
      significanceLevel: 0.95,
      power: 0.8,
      variations: 2,
    };

    const twoTailed = calculateSampleSize({ ...params, tails: "two" as const });
    const oneTailed = calculateSampleSize({ ...params, tails: "one" as const });

    expect(oneTailed.sampleSizePerVariation).toBeLessThan(
      twoTailed.sampleSizePerVariation,
    );
  });

  it("increases sample size with higher power", () => {
    const baseParams = {
      baselineRate: 0.05,
      mde: 0.2,
      significanceLevel: 0.95,
      tails: "two" as const,
      variations: 2,
    };

    const power80 = calculateSampleSize({ ...baseParams, power: 0.8 });
    const power90 = calculateSampleSize({ ...baseParams, power: 0.9 });

    expect(power90.sampleSizePerVariation).toBeGreaterThan(
      power80.sampleSizePerVariation,
    );
  });

  it("increases sample size with higher significance level", () => {
    const baseParams = {
      baselineRate: 0.05,
      mde: 0.2,
      power: 0.8,
      tails: "two" as const,
      variations: 2,
    };

    const sig95 = calculateSampleSize({
      ...baseParams,
      significanceLevel: 0.95,
    });
    const sig99 = calculateSampleSize({
      ...baseParams,
      significanceLevel: 0.99,
    });

    expect(sig99.sampleSizePerVariation).toBeGreaterThan(
      sig95.sampleSizePerVariation,
    );
  });

  it("applies Bonferroni correction for multiple variations", () => {
    const baseParams = {
      baselineRate: 0.05,
      mde: 0.2,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two" as const,
    };

    const twoVariations = calculateSampleSize({ ...baseParams, variations: 2 });
    const threeVariations = calculateSampleSize({
      ...baseParams,
      variations: 3,
    });

    // More variations = more comparisons = need larger sample per variation
    expect(threeVariations.sampleSizePerVariation).toBeGreaterThan(
      twoVariations.sampleSizePerVariation,
    );
  });

  it("calculates correct total sample size", () => {
    const result = calculateSampleSize({
      baselineRate: 0.05,
      mde: 0.2,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 3,
    });

    expect(result.totalSampleSize).toBe(result.sampleSizePerVariation * 3);
  });

  it("throws for invalid baseline rate", () => {
    expect(() =>
      calculateSampleSize({
        baselineRate: 0,
        mde: 0.2,
        significanceLevel: 0.95,
        power: 0.8,
        tails: "two",
        variations: 2,
      }),
    ).toThrow("Baseline rate must be between 0 and 1");

    expect(() =>
      calculateSampleSize({
        baselineRate: 1,
        mde: 0.2,
        significanceLevel: 0.95,
        power: 0.8,
        tails: "two",
        variations: 2,
      }),
    ).toThrow("Baseline rate must be between 0 and 1");
  });

  it("throws for invalid MDE", () => {
    expect(() =>
      calculateSampleSize({
        baselineRate: 0.05,
        mde: 0,
        significanceLevel: 0.95,
        power: 0.8,
        tails: "two",
        variations: 2,
      }),
    ).toThrow("MDE must be between 0 and 1");
  });

  it("throws when new rate would exceed 100%", () => {
    expect(() =>
      calculateSampleSize({
        baselineRate: 0.9,
        mde: 0.2, // 90% + 18% = 108%
        significanceLevel: 0.95,
        power: 0.8,
        tails: "two",
        variations: 2,
      }),
    ).toThrow("results in a rate >= 100%");
  });
});

describe("calculateSampleSizeForMde", () => {
  it("returns same result as calculateSampleSize", () => {
    const fullResult = calculateSampleSize({
      baselineRate: 0.05,
      mde: 0.2,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
    });

    const quickResult = calculateSampleSizeForMde(
      0.05,
      0.2,
      0.95,
      0.8,
      "two",
      2,
    );

    expect(quickResult).toBe(fullResult.sampleSizePerVariation);
  });

  it("returns Infinity when new rate would exceed 100%", () => {
    const result = calculateSampleSizeForMde(0.9, 0.2, 0.95, 0.8, "two", 2);
    expect(result).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("generateChartData", () => {
  it("generates correct number of data points", () => {
    const data = generateChartData({
      baselineRate: 0.05,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
      points: 20,
    });

    expect(data.length).toBe(20);
  });

  it("generates data within specified MDE range", () => {
    const data = generateChartData({
      baselineRate: 0.05,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
      mdeMin: 0.05,
      mdeMax: 0.25,
      points: 10,
    });

    expect(data[0].mde).toBeCloseTo(0.05, 5);
    expect(data[data.length - 1].mde).toBeCloseTo(0.25, 5);
  });

  it("shows sample size decreasing as MDE increases", () => {
    const data = generateChartData({
      baselineRate: 0.05,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
      points: 10,
    });

    // Sample size should decrease as MDE increases
    for (let i = 1; i < data.length; i++) {
      expect(data[i].sampleSize).toBeLessThan(data[i - 1].sampleSize);
    }
  });

  it("includes mdePercent for display", () => {
    const data = generateChartData({
      baselineRate: 0.05,
      significanceLevel: 0.95,
      power: 0.8,
      tails: "two",
      variations: 2,
      mdeMin: 0.1,
      mdeMax: 0.2,
      points: 5,
    });

    expect(data.length).toBeGreaterThan(0);
    expect(data[0].mdePercent).toBe(10);
  });
});

describe("calculateDuration", () => {
  it("calculates correct number of days", () => {
    const result = calculateDuration(
      10000, // sample size per variation
      2, // variations
      1000, // daily traffic
      1, // 100% allocation
    );

    // Total: 20,000 / 1,000 per day = 20 days
    expect(result.days).toBe(20);
    expect(result.dailyTestTraffic).toBe(1000);
  });

  it("accounts for traffic allocation", () => {
    const result = calculateDuration(
      10000,
      2,
      1000,
      0.5, // 50% allocation
    );

    // Total: 20,000 / 500 per day = 40 days
    expect(result.days).toBe(40);
    expect(result.dailyTestTraffic).toBe(500);
  });

  it("calculates completion date", () => {
    const result = calculateDuration(10000, 2, 1000, 1);

    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 20);

    // Compare dates (ignoring time)
    expect(result.completionDate.toDateString()).toBe(
      expectedDate.toDateString(),
    );
  });

  it("rounds up partial days", () => {
    const result = calculateDuration(
      10000,
      2,
      1500, // 20,000 / 1,500 = 13.33 days
      1,
    );

    expect(result.days).toBe(14);
  });

  it("throws for zero daily traffic", () => {
    expect(() => calculateDuration(10000, 2, 0, 1)).toThrow(
      "Daily test traffic must be greater than 0",
    );
  });

  it("throws for zero allocation", () => {
    expect(() => calculateDuration(10000, 2, 1000, 0)).toThrow(
      "Daily test traffic must be greater than 0",
    );
  });
});

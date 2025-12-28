import { describe, expect, it } from "vitest";
import type { Distribution } from "../types";
import {
  getDistributionDescription,
  getDistributionMean,
  lognormalFromMeanStdDev,
  lognormalToMeanStdDev,
  sampleBinary,
  sampleDistribution,
  sampleLognormal,
  sampleNormal,
  sampleTriangular,
  sampleUniform,
} from "./distributions";

describe("distributions", () => {
  describe("sampleNormal", () => {
    it("should return values centered around the mean", () => {
      const samples: number[] = [];
      for (let i = 0; i < 10000; i++) {
        samples.push(sampleNormal(100, 10));
      }
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      expect(mean).toBeCloseTo(100, 0);
    });

    it("should have approximately correct standard deviation", () => {
      const samples: number[] = [];
      for (let i = 0; i < 10000; i++) {
        samples.push(sampleNormal(0, 15));
      }
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance =
        samples.reduce((sum, x) => sum + (x - mean) ** 2, 0) / samples.length;
      const stdDev = Math.sqrt(variance);
      expect(stdDev).toBeCloseTo(15, 0);
    });
  });

  describe("sampleUniform", () => {
    it("should return values within bounds", () => {
      for (let i = 0; i < 1000; i++) {
        const value = sampleUniform(10, 20);
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThanOrEqual(20);
      }
    });

    it("should have mean at midpoint", () => {
      const samples: number[] = [];
      for (let i = 0; i < 10000; i++) {
        samples.push(sampleUniform(0, 100));
      }
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      expect(mean).toBeCloseTo(50, 0);
    });
  });

  describe("sampleTriangular", () => {
    it("should return values within bounds", () => {
      for (let i = 0; i < 1000; i++) {
        const value = sampleTriangular(10, 50, 100);
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThanOrEqual(100);
      }
    });

    it("should have expected mean", () => {
      const samples: number[] = [];
      for (let i = 0; i < 10000; i++) {
        samples.push(sampleTriangular(0, 50, 100));
      }
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      // Expected mean = (min + mode + max) / 3 = 50
      expect(mean).toBeCloseTo(50, 0);
    });

    it("should have mode as most common value region", () => {
      const samples: number[] = [];
      for (let i = 0; i < 10000; i++) {
        samples.push(sampleTriangular(0, 80, 100));
      }
      // Count samples in different regions
      const nearMode = samples.filter((x) => x >= 70 && x <= 90).length;
      const nearMin = samples.filter((x) => x >= 0 && x <= 20).length;
      expect(nearMode).toBeGreaterThan(nearMin);
    });
  });

  describe("sampleLognormal", () => {
    it("should return only positive values", () => {
      for (let i = 0; i < 1000; i++) {
        const value = sampleLognormal(0, 1);
        expect(value).toBeGreaterThan(0);
      }
    });

    it("should have approximately correct mean", () => {
      const samples: number[] = [];
      const mu = 2;
      const sigma = 0.5;
      for (let i = 0; i < 10000; i++) {
        samples.push(sampleLognormal(mu, sigma));
      }
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      // Expected mean = exp(mu + sigma^2/2)
      const expectedMean = Math.exp(mu + (sigma * sigma) / 2);
      expect(mean).toBeCloseTo(expectedMean, 0);
    });
  });

  describe("sampleBinary", () => {
    it("should return only one of two values", () => {
      for (let i = 0; i < 100; i++) {
        const value = sampleBinary(0.5, 100, 0);
        expect([0, 100]).toContain(value);
      }
    });

    it("should respect probability", () => {
      let trueCount = 0;
      const iterations = 10000;
      for (let i = 0; i < iterations; i++) {
        if (sampleBinary(0.7, 1, 0) === 1) {
          trueCount++;
        }
      }
      const ratio = trueCount / iterations;
      expect(ratio).toBeCloseTo(0.7, 1);
    });

    it("should always return true value when probability is 1", () => {
      for (let i = 0; i < 100; i++) {
        expect(sampleBinary(1, 42, 0)).toBe(42);
      }
    });

    it("should always return false value when probability is 0", () => {
      for (let i = 0; i < 100; i++) {
        expect(sampleBinary(0, 42, 99)).toBe(99);
      }
    });
  });

  describe("sampleDistribution", () => {
    it("should handle fixed distribution", () => {
      const dist: Distribution = { type: "fixed", value: 42 };
      expect(sampleDistribution(dist)).toBe(42);
    });

    it("should handle normal distribution", () => {
      const dist: Distribution = { type: "normal", mean: 100, stdDev: 10 };
      const value = sampleDistribution(dist);
      expect(typeof value).toBe("number");
      expect(Number.isFinite(value)).toBe(true);
    });

    it("should handle uniform distribution", () => {
      const dist: Distribution = { type: "uniform", min: 10, max: 20 };
      const value = sampleDistribution(dist);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(20);
    });

    it("should handle triangular distribution", () => {
      const dist: Distribution = {
        type: "triangular",
        min: 0,
        mode: 50,
        max: 100,
      };
      const value = sampleDistribution(dist);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });

    it("should handle lognormal distribution", () => {
      const dist: Distribution = { type: "lognormal", mu: 0, sigma: 0.5 };
      const value = sampleDistribution(dist);
      expect(value).toBeGreaterThan(0);
    });

    it("should handle binary distribution", () => {
      const dist: Distribution = {
        type: "binary",
        probability: 0.5,
        valueIfTrue: 100,
        valueIfFalse: 0,
      };
      const value = sampleDistribution(dist);
      expect([0, 100]).toContain(value);
    });
  });

  describe("getDistributionMean", () => {
    it("should return fixed value", () => {
      expect(getDistributionMean({ type: "fixed", value: 42 })).toBe(42);
    });

    it("should return normal mean", () => {
      expect(
        getDistributionMean({ type: "normal", mean: 100, stdDev: 10 }),
      ).toBe(100);
    });

    it("should return uniform midpoint", () => {
      expect(getDistributionMean({ type: "uniform", min: 0, max: 100 })).toBe(
        50,
      );
    });

    it("should return triangular mean", () => {
      expect(
        getDistributionMean({ type: "triangular", min: 0, mode: 50, max: 100 }),
      ).toBe(50);
    });

    it("should return lognormal mean", () => {
      const mu = 2;
      const sigma = 0.5;
      const expectedMean = Math.exp(mu + (sigma * sigma) / 2);
      expect(getDistributionMean({ type: "lognormal", mu, sigma })).toBeCloseTo(
        expectedMean,
        5,
      );
    });

    it("should return binary expected value", () => {
      expect(
        getDistributionMean({
          type: "binary",
          probability: 0.3,
          valueIfTrue: 100,
          valueIfFalse: 0,
        }),
      ).toBe(30);
    });
  });

  describe("getDistributionDescription", () => {
    it("should describe fixed", () => {
      const desc = getDistributionDescription({ type: "fixed", value: 1000 });
      // Check that it contains "1" and "000" (locale-agnostic, ignores separator)
      expect(desc.replace(/\D/g, "")).toBe("1000");
    });

    it("should describe normal", () => {
      expect(
        getDistributionDescription({ type: "normal", mean: 100, stdDev: 10 }),
      ).toContain("μ=100");
    });

    it("should describe uniform", () => {
      const desc = getDistributionDescription({
        type: "uniform",
        min: 0,
        max: 100,
      });
      expect(desc).toContain("0");
      expect(desc).toContain("100");
    });

    it("should describe binary with percentage", () => {
      const desc = getDistributionDescription({
        type: "binary",
        probability: 0.75,
        valueIfTrue: 500,
        valueIfFalse: 0,
      });
      expect(desc).toContain("75%");
      expect(desc).toContain("500");
    });
  });

  describe("lognormal parameter conversion", () => {
    it("should round-trip lognormal parameters", () => {
      const originalMean = 100;
      const originalStdDev = 30;

      const { mu, sigma } = lognormalFromMeanStdDev(
        originalMean,
        originalStdDev,
      );
      const { mean, stdDev } = lognormalToMeanStdDev(mu, sigma);

      expect(mean).toBeCloseTo(originalMean, 5);
      expect(stdDev).toBeCloseTo(originalStdDev, 5);
    });
  });
});

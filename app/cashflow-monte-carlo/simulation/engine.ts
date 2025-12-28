import type {
  CashFlowParameter,
  MonthlyStats,
  Scenario,
  SimulationConfig,
  SimulationResult,
} from "../types";
import { sampleDistribution } from "./distributions";

/**
 * Calculate percentile from a sorted array
 */
function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const index = (p / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Check if a parameter is active in a given month
 */
function isParameterActive(param: CashFlowParameter, month: number): boolean {
  if (param.startMonth !== undefined && month < param.startMonth) {
    return false;
  }
  if (param.endMonth !== undefined && month > param.endMonth) {
    return false;
  }
  return true;
}

/**
 * Get the effective amount for a parameter in a given month
 * Applies growth rate compounding
 */
function getParameterAmount(
  param: CashFlowParameter,
  month: number,
  sampledGrowthRate: number,
  sampledAmount: number,
): number {
  if (!isParameterActive(param, month)) {
    return 0;
  }

  // For one-time events, only trigger on the start month
  if (param.frequency === "one-time") {
    if (param.startMonth === undefined || month !== param.startMonth) {
      return 0;
    }
    return sampledAmount;
  }

  // For yearly events, only trigger on January (month % 12 === 0)
  if (param.frequency === "yearly" && month % 12 !== 0) {
    return 0;
  }

  // Apply compound growth rate
  // Growth rate is annual, so we need to calculate years elapsed
  const startMonth = param.startMonth ?? 0;
  const monthsElapsed = month - startMonth;
  const yearsElapsed = Math.floor(monthsElapsed / 12);

  // Compound growth: amount * (1 + rate)^years
  const growthMultiplier = (1 + sampledGrowthRate) ** yearsElapsed;

  return sampledAmount * growthMultiplier;
}

/**
 * Run a single iteration of the simulation
 * Returns an array of monthly balances
 */
export function simulateSingleIteration(
  config: SimulationConfig,
  parameters: CashFlowParameter[],
): number[] {
  const balances: number[] = [];

  // Sample all parameters once at the start of this iteration
  // This ensures consistency within the iteration
  const sampledValues = new Map<
    string,
    { amount: number; growthRate: number; returnRate: number }
  >();

  for (const param of parameters) {
    sampledValues.set(param.id, {
      amount: sampleDistribution(param.amount),
      growthRate: sampleDistribution(param.growthRate),
      returnRate: param.returnRate ? sampleDistribution(param.returnRate) : 0,
    });
  }

  // Sample initial balance and inflation
  let balance = sampleDistribution(config.initialBalance);
  const annualInflation = sampleDistribution(config.inflationRate);

  // Track cumulative investment value for return calculation
  let investmentValue = 0;
  const investments = parameters.filter((p) => p.category === "investment");
  const income = parameters.filter((p) => p.category === "income");
  const expenses = parameters.filter((p) => p.category === "expense");
  const oneTime = parameters.filter((p) => p.category === "one-time");

  for (let month = 0; month < config.timeHorizonMonths; month++) {
    // Calculate income
    let monthlyIncome = 0;
    for (const param of income) {
      const sampled = sampledValues.get(param.id);
      if (!sampled) continue;
      monthlyIncome += getParameterAmount(
        param,
        month,
        sampled.growthRate,
        sampled.amount,
      );
    }

    // Calculate expenses (with inflation adjustment)
    let monthlyExpenses = 0;
    const inflationMultiplier = (1 + annualInflation) ** (month / 12);
    for (const param of expenses) {
      const sampled = sampledValues.get(param.id);
      if (!sampled) continue;
      const baseExpense = getParameterAmount(
        param,
        month,
        sampled.growthRate,
        sampled.amount,
      );
      monthlyExpenses += baseExpense * inflationMultiplier;
    }

    // Calculate one-time events
    let oneTimeNet = 0;
    for (const param of oneTime) {
      const sampled = sampledValues.get(param.id);
      if (!sampled) continue;
      const amount = getParameterAmount(
        param,
        month,
        sampled.growthRate,
        sampled.amount,
      );
      // One-time events in income contribute positively, expenses negatively
      // For simplicity, treat positive amounts as income, negative as expense
      oneTimeNet += amount;
    }

    // Calculate investment contributions and returns
    let investmentContribution = 0;
    for (const inv of investments) {
      const sampled = sampledValues.get(inv.id);
      if (!sampled) continue;
      investmentContribution += getParameterAmount(
        inv,
        month,
        sampled.growthRate,
        sampled.amount,
      );
    }

    // Investment returns on cumulative value (monthly rate)
    let investmentReturns = 0;
    for (const inv of investments) {
      const sampled = sampledValues.get(inv.id);
      if (!sampled) continue;
      const monthlyReturnRate = sampled.returnRate / 12;
      investmentReturns += investmentValue * monthlyReturnRate;
    }

    // Update investment value
    investmentValue += investmentContribution + investmentReturns;

    // Calculate net cash flow
    // Income - expenses + one-time - investment contributions (money going into investments)
    const netCashFlow =
      monthlyIncome - monthlyExpenses + oneTimeNet - investmentContribution;

    // Update balance
    balance += netCashFlow;

    // Add investment returns to balance (or keep them in investments?)
    // For this model, investment returns stay in the investment
    // But we'll report total wealth = cash balance + investment value
    balances.push(balance + investmentValue);
  }

  return balances;
}

/**
 * Aggregate multiple simulation iterations into statistics
 */
function aggregateResults(
  iterations: number[][],
  timeHorizonMonths: number,
): MonthlyStats[] {
  const stats: MonthlyStats[] = [];

  for (let month = 0; month < timeHorizonMonths; month++) {
    const values = iterations.map((iter) => iter[month]).sort((a, b) => a - b);

    stats.push({
      month,
      p5: percentile(values, 5),
      p10: percentile(values, 10),
      p25: percentile(values, 25),
      p50: percentile(values, 50),
      p75: percentile(values, 75),
      p90: percentile(values, 90),
      p95: percentile(values, 95),
      mean: values.reduce((a, b) => a + b, 0) / values.length,
    });
  }

  return stats;
}

/**
 * Run the full Monte Carlo simulation
 */
export function runSimulation(
  scenario: Scenario,
  onProgress?: (completed: number, total: number) => void,
  goalAmount?: number,
): SimulationResult {
  const startTime = performance.now();
  const { config, parameters } = scenario;
  const iterations: number[][] = [];

  for (let i = 0; i < config.iterations; i++) {
    const balances = simulateSingleIteration(config, parameters);
    iterations.push(balances);

    // Report progress every 100 iterations
    if (onProgress && i % 100 === 0) {
      onProgress(i, config.iterations);
    }
  }

  // Final progress update
  if (onProgress) {
    onProgress(config.iterations, config.iterations);
  }

  const monthlyStats = aggregateResults(iterations, config.timeHorizonMonths);

  // Get final balance distribution
  const finalBalances = iterations
    .map((iter) => iter[iter.length - 1])
    .sort((a, b) => a - b);

  // Calculate probability of positive balance at end
  const positiveCount = finalBalances.filter((b) => b > 0).length;
  const probabilityPositive = positiveCount / finalBalances.length;

  // Calculate probability of hitting goal if specified
  let probabilityGoal: number | undefined;
  if (goalAmount !== undefined) {
    const goalCount = finalBalances.filter((b) => b >= goalAmount).length;
    probabilityGoal = goalCount / finalBalances.length;
  }

  const endTime = performance.now();

  return {
    monthlyStats,
    finalBalanceDistribution: finalBalances,
    probabilityPositive,
    probabilityGoal,
    runTimeMs: endTime - startTime,
  };
}

import type { Scenario, SimulationConfig } from "./types";

const STORAGE_KEY = "cashflow-monte-carlo-scenarios";
const CURRENT_VERSION = 1;

export interface StorageAdapter {
  getScenarios(): Scenario[];
  getScenario(id: string): Scenario | undefined;
  saveScenario(scenario: Scenario): void;
  deleteScenario(id: string): void;
}

function getDefaultConfig(): SimulationConfig {
  return {
    initialBalance: { type: "fixed", value: 10000 },
    timeHorizonMonths: 60,
    iterations: 1000,
    inflationRate: { type: "normal", mean: 0.03, stdDev: 0.01 },
    currency: "USD",
  };
}

export function createNewScenario(name: string): Scenario {
  return {
    id: crypto.randomUUID(),
    name,
    parameters: [],
    config: getDefaultConfig(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createFreelancerExample(): Scenario {
  return {
    id: crypto.randomUUID(),
    name: "Freelancer Example",
    config: {
      initialBalance: { type: "fixed", value: 10000 },
      timeHorizonMonths: 60,
      iterations: 1000,
      inflationRate: { type: "normal", mean: 0.03, stdDev: 0.01 },
      currency: "USD",
    },
    parameters: [
      {
        id: crypto.randomUUID(),
        name: "Client Projects",
        category: "income",
        amount: { type: "normal", mean: 5000, stdDev: 1500 },
        growthRate: { type: "uniform", min: 0.02, max: 0.08 },
        frequency: "monthly",
      },
      {
        id: crypto.randomUUID(),
        name: "Rent",
        category: "expense",
        amount: { type: "fixed", value: 1500 },
        growthRate: { type: "fixed", value: 0.03 },
        frequency: "monthly",
      },
      {
        id: crypto.randomUUID(),
        name: "Living Expenses",
        category: "expense",
        amount: { type: "triangular", min: 800, mode: 1200, max: 2000 },
        growthRate: { type: "normal", mean: 0.025, stdDev: 0.01 },
        frequency: "monthly",
      },
      {
        id: crypto.randomUUID(),
        name: "Big Client Contract",
        category: "one-time",
        amount: {
          type: "binary",
          probability: 0.3,
          valueIfTrue: 20000,
          valueIfFalse: 0,
        },
        growthRate: { type: "fixed", value: 0 },
        frequency: "one-time",
        startMonth: 12,
      },
      {
        id: crypto.randomUUID(),
        name: "Index Fund",
        category: "investment",
        amount: { type: "fixed", value: 500 },
        growthRate: { type: "fixed", value: 0 },
        frequency: "monthly",
        returnRate: { type: "normal", mean: 0.07, stdDev: 0.15 },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

class LocalStorageAdapter implements StorageAdapter {
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    // Check version and migrate if needed
    const versionKey = `${STORAGE_KEY}-version`;
    const storedVersion = localStorage.getItem(versionKey);

    if (!storedVersion) {
      // First time or pre-version data
      localStorage.setItem(versionKey, String(CURRENT_VERSION));
    } else if (Number(storedVersion) < CURRENT_VERSION) {
      // Future migrations would go here
      localStorage.setItem(versionKey, String(CURRENT_VERSION));
    }

    this.initialized = true;
  }

  private getScenariosRaw(): Scenario[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getScenarios(): Scenario[] {
    this.ensureInitialized();
    return this.getScenariosRaw();
  }

  getScenario(id: string): Scenario | undefined {
    return this.getScenarios().find((s) => s.id === id);
  }

  saveScenario(scenario: Scenario): void {
    this.ensureInitialized();
    const scenarios = this.getScenarios();
    const index = scenarios.findIndex((s) => s.id === scenario.id);

    const updatedScenario = {
      ...scenario,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      scenarios[index] = updatedScenario;
    } else {
      scenarios.push(updatedScenario);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  }

  deleteScenario(id: string): void {
    this.ensureInitialized();
    const scenarios = this.getScenarios().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();

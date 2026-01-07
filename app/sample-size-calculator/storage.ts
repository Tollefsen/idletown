import { DEFAULT_PARAMS } from "./presets";
import type { SampleSizeParams, Scenario } from "./types";

const STORAGE_KEY = "sample-size-calculator-scenarios";
const CURRENT_VERSION = 1;

export interface StorageAdapter {
  getScenarios(): Scenario[];
  getScenario(id: string): Scenario | undefined;
  saveScenario(scenario: Scenario): void;
  deleteScenario(id: string): void;
}

/**
 * Create a new scenario with default parameters
 */
export function createNewScenario(name: string): Scenario {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    params: { ...DEFAULT_PARAMS },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a scenario from custom parameters
 */
export function createScenarioFromParams(
  name: string,
  params: SampleSizeParams,
  description?: string,
): Scenario {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    description,
    params: { ...params },
    createdAt: now,
    updatedAt: now,
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

    const updatedScenario: Scenario = {
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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_PARAMS } from "./presets";
import {
  createNewScenario,
  createScenarioFromParams,
  storage,
} from "./storage";
import type { SampleSizeParams } from "./types";

describe("createNewScenario", () => {
  it("creates a scenario with default parameters", () => {
    const scenario = createNewScenario("Test Scenario");

    expect(scenario.name).toBe("Test Scenario");
    expect(scenario.id).toBeDefined();
    expect(scenario.params).toEqual(DEFAULT_PARAMS);
    expect(scenario.createdAt).toBeDefined();
    expect(scenario.updatedAt).toBeDefined();
  });

  it("generates unique IDs for each scenario", () => {
    const scenario1 = createNewScenario("Scenario 1");
    const scenario2 = createNewScenario("Scenario 2");

    expect(scenario1.id).not.toBe(scenario2.id);
  });
});

describe("createScenarioFromParams", () => {
  it("creates a scenario with custom parameters", () => {
    const customParams: SampleSizeParams = {
      baselineRate: 0.1,
      mde: 0.15,
      significanceLevel: 0.99,
      power: 0.9,
      tails: "one",
      variations: 3,
    };

    const scenario = createScenarioFromParams(
      "Custom Test",
      customParams,
      "A test description",
    );

    expect(scenario.name).toBe("Custom Test");
    expect(scenario.description).toBe("A test description");
    expect(scenario.params).toEqual(customParams);
  });

  it("does not mutate the original params object", () => {
    const customParams: SampleSizeParams = {
      baselineRate: 0.1,
      mde: 0.15,
      significanceLevel: 0.99,
      power: 0.9,
      tails: "one",
      variations: 3,
    };

    const scenario = createScenarioFromParams("Test", customParams);
    scenario.params.baselineRate = 0.5;

    expect(customParams.baselineRate).toBe(0.1);
  });
});

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getScenarios", () => {
    it("returns empty array when no scenarios exist", () => {
      const scenarios = storage.getScenarios();
      expect(scenarios).toEqual([]);
    });

    it("returns saved scenarios", () => {
      const scenario = createNewScenario("Test");
      storage.saveScenario(scenario);

      const scenarios = storage.getScenarios();
      expect(scenarios).toHaveLength(1);
      expect(scenarios[0].name).toBe("Test");
    });
  });

  describe("getScenario", () => {
    it("returns undefined for non-existent scenario", () => {
      const scenario = storage.getScenario("non-existent-id");
      expect(scenario).toBeUndefined();
    });

    it("returns the correct scenario by ID", () => {
      const scenario1 = createNewScenario("First");
      const scenario2 = createNewScenario("Second");
      storage.saveScenario(scenario1);
      storage.saveScenario(scenario2);

      const found = storage.getScenario(scenario2.id);
      expect(found?.name).toBe("Second");
    });
  });

  describe("saveScenario", () => {
    it("saves a new scenario", () => {
      const scenario = createNewScenario("New Scenario");
      storage.saveScenario(scenario);

      const scenarios = storage.getScenarios();
      expect(scenarios).toHaveLength(1);
    });

    it("updates an existing scenario", () => {
      const scenario = createNewScenario("Original Name");
      storage.saveScenario(scenario);

      const updated = { ...scenario, name: "Updated Name" };
      storage.saveScenario(updated);

      const scenarios = storage.getScenarios();
      expect(scenarios).toHaveLength(1);
      expect(scenarios[0].name).toBe("Updated Name");
    });

    it("updates the updatedAt timestamp", () => {
      const scenario = createNewScenario("Test");

      // Modify the scenario's updatedAt to be in the past
      scenario.updatedAt = "2020-01-01T00:00:00.000Z";

      storage.saveScenario(scenario);
      const saved = storage.getScenario(scenario.id);

      // The saved version should have a newer updatedAt
      expect(saved?.updatedAt).not.toBe("2020-01-01T00:00:00.000Z");
      expect(new Date(saved?.updatedAt ?? 0).getTime()).toBeGreaterThan(
        new Date("2020-01-01T00:00:00.000Z").getTime(),
      );
    });
  });

  describe("deleteScenario", () => {
    it("deletes an existing scenario", () => {
      const scenario = createNewScenario("To Delete");
      storage.saveScenario(scenario);

      storage.deleteScenario(scenario.id);

      const scenarios = storage.getScenarios();
      expect(scenarios).toHaveLength(0);
    });

    it("does nothing when deleting non-existent scenario", () => {
      const scenario = createNewScenario("Keep");
      storage.saveScenario(scenario);

      storage.deleteScenario("non-existent-id");

      const scenarios = storage.getScenarios();
      expect(scenarios).toHaveLength(1);
    });

    it("only deletes the specified scenario", () => {
      const scenario1 = createNewScenario("First");
      const scenario2 = createNewScenario("Second");
      storage.saveScenario(scenario1);
      storage.saveScenario(scenario2);

      storage.deleteScenario(scenario1.id);

      const scenarios = storage.getScenarios();
      expect(scenarios).toHaveLength(1);
      expect(scenarios[0].id).toBe(scenario2.id);
    });
  });
});

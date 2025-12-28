"use client";

import { useId, useState } from "react";
import {
  createFreelancerExample,
  createNewScenario,
  storage,
} from "../storage";
import type { Scenario } from "../types";

type ScenarioManagerProps = {
  currentScenario: Scenario;
  onScenarioChange: (scenario: Scenario) => void;
  onSave: () => void;
};

export function ScenarioManager({
  currentScenario,
  onScenarioChange,
  onSave,
}: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>(() =>
    storage.getScenarios(),
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(currentScenario.name);
  const selectId = useId();
  const renameId = useId();

  const refreshScenarios = () => {
    setScenarios(storage.getScenarios());
  };

  const handleSelect = (id: string) => {
    if (id === "new") {
      const scenario = createNewScenario("New Scenario");
      storage.saveScenario(scenario);
      refreshScenarios();
      onScenarioChange(scenario);
    } else if (id === "example") {
      const scenario = createFreelancerExample();
      storage.saveScenario(scenario);
      refreshScenarios();
      onScenarioChange(scenario);
    } else {
      const scenario = storage.getScenario(id);
      if (scenario) {
        onScenarioChange(scenario);
      }
    }
  };

  const handleDelete = () => {
    if (scenarios.length <= 1) {
      alert("Cannot delete the last scenario");
      return;
    }

    if (!confirm(`Delete "${currentScenario.name}"?`)) {
      return;
    }

    storage.deleteScenario(currentScenario.id);
    refreshScenarios();

    // Load another scenario
    const remaining = storage.getScenarios();
    if (remaining.length > 0) {
      onScenarioChange(remaining[0]);
    }
  };

  const handleRename = () => {
    if (newName.trim()) {
      const updated = { ...currentScenario, name: newName.trim() };
      storage.saveScenario(updated);
      refreshScenarios();
      onScenarioChange(updated);
    }
    setIsRenaming(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={selectId} className="sr-only">
        Select Scenario
      </label>
      <select
        id={selectId}
        value={currentScenario.id}
        onChange={(e) => handleSelect(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
      >
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
        <option disabled>──────────</option>
        <option value="new">+ New Scenario</option>
        <option value="example">+ Freelancer Example</option>
      </select>

      {isRenaming ? (
        <div className="flex items-center gap-2">
          <label htmlFor={renameId} className="sr-only">
            New name
          </label>
          <input
            id={renameId}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={handleRename}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsRenaming(false)}
            className="px-3 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setNewName(currentScenario.name);
              setIsRenaming(true);
            }}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}

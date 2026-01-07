"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PRESETS } from "../presets";
import { createScenarioFromParams, storage } from "../storage";
import type { SampleSizeParams, Scenario } from "../types";

interface ScenarioManagerProps {
  currentParams: SampleSizeParams;
  onParamsChange: (params: SampleSizeParams) => void;
}

export function ScenarioManager({
  currentParams,
  onParamsChange,
}: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>(() =>
    storage.getScenarios(),
  );
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const saveInputRef = useRef<HTMLInputElement>(null);
  const saveInputId = useId();

  // Focus input when modal opens
  useEffect(() => {
    if (showSaveModal && saveInputRef.current) {
      saveInputRef.current.focus();
    }
  }, [showSaveModal]);

  const refreshScenarios = () => {
    setScenarios(storage.getScenarios());
  };

  const handleLoadScenario = (id: string) => {
    const scenario = storage.getScenario(id);
    if (scenario) {
      onParamsChange(scenario.params);
    }
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onParamsChange(preset.params);
    }
  };

  const handleSave = () => {
    if (!saveName.trim()) return;

    const scenario = createScenarioFromParams(saveName.trim(), currentParams);
    storage.saveScenario(scenario);
    refreshScenarios();
    setShowSaveModal(false);
    setSaveName("");
  };

  const handleDelete = (id: string) => {
    const scenario = scenarios.find((s) => s.id === id);
    if (!scenario) return;

    if (!confirm(`Delete "${scenario.name}"?`)) {
      return;
    }

    storage.deleteScenario(id);
    refreshScenarios();
  };

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Load Preset
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadPreset(preset.id)}
              className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-colors"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Saved Scenarios */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Saved Scenarios
          </p>
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Save Current
          </button>
        </div>

        {scenarios.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No saved scenarios yet. Click "Save Current" to save your
            configuration.
          </p>
        ) : (
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => handleLoadScenario(scenario.id)}
                  className="text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 text-left flex-1"
                >
                  {scenario.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(scenario.id)}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-2 py-1"
                  title="Delete scenario"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Save Scenario
            </h3>
            <div className="mb-4">
              <label
                htmlFor={saveInputId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Scenario Name
              </label>
              <input
                ref={saveInputRef}
                id={saveInputId}
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setShowSaveModal(false);
                }}
                placeholder="e.g., Homepage CTA test"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveName("");
                }}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

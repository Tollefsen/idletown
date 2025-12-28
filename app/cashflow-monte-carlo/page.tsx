"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfigPanel } from "./components/ConfigPanel";
import { ParameterList } from "./components/ParameterList";
import { ResultsSummary } from "./components/ResultsSummary";
import { ScenarioManager } from "./components/ScenarioManager";
import { SimulationChart } from "./components/SimulationChart";
import { SimulationControls } from "./components/SimulationControls";
import { runSimulation } from "./simulation/engine";
import { createFreelancerExample, storage } from "./storage";
import type {
  CashFlowParameter,
  Scenario,
  SimulationConfig,
  SimulationResult,
} from "./types";

export default function CashFlowMonteCarloPage() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showYearly, setShowYearly] = useState(false);
  const [goalAmount, setGoalAmount] = useState<number | undefined>(undefined);

  // Initialize scenario from storage or create example
  useEffect(() => {
    const scenarios = storage.getScenarios();
    if (scenarios.length > 0) {
      setScenario(scenarios[0]);
    } else {
      // Create and save the example scenario
      const example = createFreelancerExample();
      storage.saveScenario(example);
      setScenario(example);
    }
  }, []);

  const handleScenarioChange = useCallback((newScenario: Scenario) => {
    setScenario(newScenario);
    setResult(null); // Clear results when switching scenarios
  }, []);

  const handleSave = useCallback(() => {
    if (scenario) {
      storage.saveScenario(scenario);
    }
  }, [scenario]);

  const handleParametersChange = useCallback(
    (parameters: CashFlowParameter[]) => {
      if (scenario) {
        setScenario({ ...scenario, parameters });
      }
    },
    [scenario],
  );

  const handleConfigChange = useCallback(
    (config: SimulationConfig) => {
      if (scenario) {
        setScenario({ ...scenario, config });
      }
    },
    [scenario],
  );

  const handleIterationsChange = useCallback(
    (iterations: number) => {
      if (scenario) {
        setScenario({
          ...scenario,
          config: { ...scenario.config, iterations },
        });
      }
    },
    [scenario],
  );

  const handleRunSimulation = useCallback(() => {
    if (!scenario) return;

    setIsRunning(true);
    setProgress(0);

    // Use setTimeout to allow UI to update before running simulation
    setTimeout(() => {
      try {
        const simResult = runSimulation(
          scenario,
          (completed, total) => {
            setProgress((completed / total) * 100);
          },
          goalAmount,
        );
        setResult(simResult);
      } catch (error) {
        console.error("Simulation error:", error);
        alert("Simulation failed. Please check your parameters.");
      } finally {
        setIsRunning(false);
        setProgress(100);
      }
    }, 50);
  }, [scenario, goalAmount]);

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <a
                href="/"
                className="text-sm text-blue-600 hover:underline mb-1 block"
              >
                &larr; Back to Idle Town
              </a>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Cash Flow Monte Carlo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Predict your financial future with probability distributions
              </p>
            </div>
            <ScenarioManager
              currentScenario={scenario}
              onScenarioChange={handleScenarioChange}
              onSave={handleSave}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Parameters */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Parameters
              </h2>
              <ParameterList
                parameters={scenario.parameters}
                onChange={handleParametersChange}
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <ConfigPanel
                config={scenario.config}
                onChange={handleConfigChange}
              />
            </div>
          </div>

          {/* Right column: Results */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Simulation Results
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={showYearly}
                      onChange={(e) => setShowYearly(e.target.checked)}
                      className="mr-2"
                    />
                    Yearly view
                  </label>
                </div>
              </div>

              <SimulationChart
                data={result?.monthlyStats ?? []}
                currency={scenario.config.currency}
                showYearly={showYearly}
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Summary
              </h2>
              <ResultsSummary
                result={result}
                currency={scenario.config.currency}
                goalAmount={goalAmount}
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="goal-amount"
                    className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
                  >
                    Goal Amount (optional):
                  </label>
                  <input
                    id="goal-amount"
                    type="number"
                    value={goalAmount ?? ""}
                    onChange={(e) =>
                      setGoalAmount(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    placeholder="e.g., 100000"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <SimulationControls
                  iterations={scenario.config.iterations}
                  onIterationsChange={handleIterationsChange}
                  onRun={handleRunSimulation}
                  isRunning={isRunning}
                  progress={progress}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

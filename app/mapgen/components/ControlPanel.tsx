"use client";

import { useState } from "react";
import { Button } from "@/app/components";
import { DEFAULT_NOISE_PARAMS } from "../lib/noise";
import { generateRandomSeed } from "../lib/seededRandom";
import {
  DEFAULT_FEATURE_DENSITY,
  type FeatureDensity,
  type MapSize,
  type WorldParams,
  type WorldShape,
} from "../lib/worldgen";

type ControlPanelProps = {
  params: WorldParams;
  onParamsChange: (params: WorldParams) => void;
  onGenerate: () => void;
  isGenerating: boolean;
};

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  // Format value based on step size
  const formattedValue = step >= 1 ? value.toString() : value.toFixed(2);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500 font-mono">{formattedValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}

const SIZE_OPTIONS: { value: MapSize; label: string }[] = [
  { value: 512, label: "512px" },
  { value: 768, label: "768px" },
  { value: 1024, label: "1024px" },
];

const SHAPE_OPTIONS: { value: WorldShape; label: string }[] = [
  { value: "archipelago", label: "Archipelago" },
  { value: "continent", label: "Continent" },
  { value: "pangaea", label: "Pangaea" },
  { value: "multiContinent", label: "Multi" },
  { value: "random", label: "Random" },
];

export function ControlPanel({
  params,
  onParamsChange,
  onGenerate,
  isGenerating,
}: ControlPanelProps) {
  const [featuresExpanded, setFeaturesExpanded] = useState(false);

  const handleSeedChange = (seed: string) => {
    onParamsChange({ ...params, seed: seed.toUpperCase() });
  };

  const handleRandomSeed = () => {
    onParamsChange({ ...params, seed: generateRandomSeed() });
  };

  const handleSizeChange = (size: MapSize) => {
    onParamsChange({ ...params, size });
  };

  const handleShapeChange = (shape: WorldShape) => {
    onParamsChange({ ...params, shape });
  };

  const handleSeaLevelChange = (seaLevel: number) => {
    onParamsChange({ ...params, seaLevel });
  };

  const handleIslandFactorChange = (islandFactor: number) => {
    onParamsChange({ ...params, islandFactor });
  };

  const handleNoiseScaleChange = (scale: number) => {
    onParamsChange({
      ...params,
      noiseParams: { ...params.noiseParams, scale },
    });
  };

  const handleOctavesChange = (octaves: number) => {
    onParamsChange({
      ...params,
      noiseParams: { ...params.noiseParams, octaves: Math.round(octaves) },
    });
  };

  const handleFeatureDensityChange = (
    key: keyof FeatureDensity,
    value: number,
  ) => {
    onParamsChange({
      ...params,
      featureDensity: { ...params.featureDensity, [key]: Math.round(value) },
    });
  };

  const handleReset = () => {
    onParamsChange({
      ...params,
      size: 512,
      shape: "archipelago",
      seaLevel: 0.4,
      islandFactor: 0.7,
      noiseParams: DEFAULT_NOISE_PARAMS,
      featureDensity: DEFAULT_FEATURE_DENSITY,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg w-72">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        World Parameters
      </h2>

      {/* Seed Input */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="seed-input"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          Seed
        </label>
        <div className="flex gap-2">
          <input
            id="seed-input"
            type="text"
            value={params.seed}
            onChange={(e) => handleSeedChange(e.target.value)}
            maxLength={16}
            className="flex-1 px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Enter seed..."
          />
          <Button variant="ghost" size="sm" onClick={handleRandomSeed}>
            Random
          </Button>
        </div>
      </div>

      {/* Map Size Selector */}
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Map Size
        </span>
        <div className="flex gap-1">
          {SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSizeChange(option.value)}
              className={`flex-1 px-2 py-1.5 text-sm rounded border transition-colors ${
                params.size === option.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* World Shape Selector */}
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          World Shape
        </span>
        <div className="flex flex-wrap gap-1">
          {SHAPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleShapeChange(option.value)}
              className={`px-2 py-1.5 text-sm rounded border transition-colors ${
                params.shape === option.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-3">
        <Slider
          label="Sea Level"
          value={params.seaLevel}
          min={0.2}
          max={0.6}
          step={0.01}
          onChange={handleSeaLevelChange}
        />

        <Slider
          label="Land Spread"
          value={params.islandFactor}
          min={0}
          max={1.5}
          step={0.05}
          onChange={handleIslandFactorChange}
        />

        <Slider
          label="Terrain Scale"
          value={params.noiseParams.scale}
          min={30}
          max={200}
          step={5}
          onChange={handleNoiseScaleChange}
        />

        <Slider
          label="Detail (Octaves)"
          value={params.noiseParams.octaves}
          min={1}
          max={8}
          step={1}
          onChange={handleOctavesChange}
        />
      </div>

      {/* Terrain Features (Collapsible) */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setFeaturesExpanded(!featuresExpanded)}
          className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <span>Terrain Features</span>
          <span className="text-xs">{featuresExpanded ? "▼" : "▶"}</span>
        </button>
        {featuresExpanded && (
          <div className="flex flex-col gap-3 pt-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
            <Slider
              label="Lakes"
              value={params.featureDensity.lakes}
              min={0}
              max={10}
              step={1}
              onChange={(v) => handleFeatureDensityChange("lakes", v)}
            />
            <Slider
              label="Inland Seas"
              value={params.featureDensity.inlandSeas}
              min={0}
              max={3}
              step={1}
              onChange={(v) => handleFeatureDensityChange("inlandSeas", v)}
            />
            <Slider
              label="Mountains"
              value={params.featureDensity.mountains}
              min={0}
              max={5}
              step={1}
              onChange={(v) => handleFeatureDensityChange("mountains", v)}
            />
            <Slider
              label="Rivers"
              value={params.featureDensity.rivers}
              min={0}
              max={15}
              step={1}
              onChange={(v) => handleFeatureDensityChange("rivers", v)}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <Button
          variant="primary"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate World"}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset Parameters
        </Button>
      </div>
    </div>
  );
}

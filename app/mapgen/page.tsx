"use client";

import { useCallback, useEffect, useState } from "react";
import { BackLink, Container, Heading } from "@/app/components";
import { ControlPanel } from "./components/ControlPanel";
import { WorldCanvas } from "./components/WorldCanvas";
import { getBiomeLegend } from "./lib/biomes";
import { generateRandomSeed } from "./lib/seededRandom";
import {
  DEFAULT_WORLD_PARAMS,
  generateWorld,
  type WorldData,
  type WorldParams,
} from "./lib/worldgen";

export default function MapGenPage() {
  const [params, setParams] = useState<WorldParams>({
    ...DEFAULT_WORLD_PARAMS,
    seed: generateRandomSeed(),
  });
  const [worldData, setWorldData] = useState<WorldData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const data = generateWorld(params);
      setWorldData(data);
      setIsGenerating(false);
    }, 10);
  }, [params]);

  // Generate initial world on mount
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const biomeLegend = getBiomeLegend();

  return (
    <Container size="xl" className="py-8">
      <BackLink href="/" />

      <div className="mb-6">
        <Heading as="h1">World Map Generator</Heading>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Procedural world generation with multi-octave fractal noise and
          climate-based biomes.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls */}
        <ControlPanel
          params={params}
          onParamsChange={setParams}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        {/* Map Display */}
        <div className="flex flex-col gap-4">
          <WorldCanvas
            worldData={worldData}
            isGenerating={isGenerating}
            size={params.size}
            biomeLegend={biomeLegend}
          />

          {/* Current Seed Display */}
          {worldData && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Seed: <span className="font-mono font-medium">{params.seed}</span>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

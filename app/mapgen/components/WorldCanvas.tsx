"use client";

import { useEffect, useRef, useState } from "react";
import type { MapSize, WorldData } from "../lib/worldgen";

type BiomeLegendItem = {
  name: string;
  color: string;
};

type WorldCanvasProps = {
  worldData: WorldData | null;
  isGenerating: boolean;
  size: MapSize;
  biomeLegend: BiomeLegendItem[];
};

export function WorldCanvas({
  worldData,
  isGenerating,
  size,
  biomeLegend,
}: WorldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !worldData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = worldData.width;
    canvas.height = worldData.height;

    // Draw the world
    ctx.putImageData(worldData.imageData, 0, 0);
  }, [worldData]);

  // Display size matches generation size, capped at reasonable screen size
  const displaySize = Math.min(size, 1024);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg"
        style={{
          imageRendering: "pixelated",
          width: `${displaySize}px`,
          height: `${displaySize}px`,
        }}
      />

      {/* Legend Toggle Button */}
      {worldData && !isGenerating && (
        <button
          type="button"
          onClick={() => setShowLegend(!showLegend)}
          className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded bg-white/85 dark:bg-gray-800/85 backdrop-blur-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm"
        >
          {showLegend ? "Hide Legend" : "Legend"}
        </button>
      )}

      {/* Legend Overlay */}
      {showLegend && worldData && !isGenerating && (
        <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-gray-600 shadow-lg max-w-[280px]">
          <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Biomes
          </h4>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {biomeLegend.map(({ name, color }) => (
              <div key={name} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm border border-gray-400/50 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] text-gray-700 dark:text-gray-300 leading-tight">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generating Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
          <div className="text-white font-medium">Generating...</div>
        </div>
      )}

      {/* Empty State */}
      {!worldData && !isGenerating && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
          style={{ width: `${displaySize}px`, height: `${displaySize}px` }}
        >
          <div className="text-gray-500">
            Click "Generate" to create a world
          </div>
        </div>
      )}
    </div>
  );
}

import * as React from "react";
import type { AdjacencyRule, Tile } from "../types";

type TileRuleCardProps = {
  tile: Tile;
  rule: AdjacencyRule;
  allSockets: string[];
  onRuleChange: (rule: AdjacencyRule) => void;
  onRemove: () => void;
};

export function TileRuleCard({
  tile,
  rule,
  allSockets,
  onRuleChange,
  onRemove,
}: TileRuleCardProps) {
  const previewSize = 64;
  const pixelSize = previewSize / tile.size;

  const handleSocketChange = (
    edge: "top" | "right" | "bottom" | "left",
    value: string,
  ) => {
    onRuleChange({
      ...rule,
      sockets: {
        ...rule.sockets,
        [edge]: value,
      },
    });
  };

  const handleWeightChange = (weight: number) => {
    onRuleChange({
      ...rule,
      weight: Math.max(0.1, weight),
    });
  };

  const handleRotatableChange = (rotatable: boolean) => {
    onRuleChange({
      ...rule,
      rotatable,
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        {/* Tile Preview */}
        <div className="flex-shrink-0">
          <div
            className="border border-gray-300 dark:border-gray-600"
            style={{
              width: previewSize,
              height: previewSize,
              display: "grid",
              gridTemplateColumns: `repeat(${tile.size}, ${pixelSize}px)`,
              gridTemplateRows: `repeat(${tile.size}, ${pixelSize}px)`,
              imageRendering: "pixelated",
            }}
          >
            {tile.pixels.flat().map((color, i) => {
              const x = i % tile.size;
              const y = Math.floor(i / tile.size);
              return (
                <div
                  key={`${x}-${y}`}
                  style={{
                    backgroundColor: color || "transparent",
                    width: pixelSize,
                    height: pixelSize,
                  }}
                />
              );
            })}
          </div>
          <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400 truncate max-w-[64px]">
            {tile.name}
          </div>
        </div>

        {/* Socket Editor */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
            {/* Top socket */}
            <div />
            <SocketInput
              value={rule.sockets.top}
              onChange={(v) => handleSocketChange("top", v)}
              allSockets={allSockets}
              label="Top"
            />
            <div />

            {/* Left and Right sockets */}
            <SocketInput
              value={rule.sockets.left}
              onChange={(v) => handleSocketChange("left", v)}
              allSockets={allSockets}
              label="Left"
            />
            <div className="w-16 h-8" />
            <SocketInput
              value={rule.sockets.right}
              onChange={(v) => handleSocketChange("right", v)}
              allSockets={allSockets}
              label="Right"
            />

            {/* Bottom socket */}
            <div />
            <SocketInput
              value={rule.sockets.bottom}
              onChange={(v) => handleSocketChange("bottom", v)}
              allSockets={allSockets}
              label="Bottom"
            />
            <div />
          </div>
        </div>

        {/* Options */}
        <div className="flex-shrink-0 space-y-2">
          <div>
            <label
              htmlFor={`weight-${rule.tileId}`}
              className="text-xs text-gray-600 dark:text-gray-400 block mb-1"
            >
              Weight
            </label>
            <input
              id={`weight-${rule.tileId}`}
              type="number"
              min="0.1"
              step="0.1"
              value={rule.weight}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
          </div>
          <div className="flex items-center gap-1 text-xs">
            <input
              id={`rotatable-${rule.tileId}`}
              type="checkbox"
              checked={rule.rotatable}
              onChange={(e) => handleRotatableChange(e.target.checked)}
              className="rounded"
            />
            <label htmlFor={`rotatable-${rule.tileId}`}>Rotatable</label>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// Predefined socket options that are always available
const PRESET_SOCKETS = [
  "any",
  "edge-a",
  "edge-b",
  "edge-c",
  "ground",
  "sky",
  "wall",
  "corner",
  "open",
  "closed",
];

const CUSTOM_SOCKET_VALUE = "__custom__";

type SocketInputProps = {
  value: string;
  onChange: (value: string) => void;
  allSockets: string[];
  label: string;
};

function SocketInput({ value, onChange, allSockets, label }: SocketInputProps) {
  const [isCustomMode, setIsCustomMode] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");

  // Combine preset sockets with user-defined sockets (deduped)
  const availableSockets = React.useMemo(() => {
    const combined = new Set(PRESET_SOCKETS);
    for (const socket of allSockets) {
      combined.add(socket);
    }
    return Array.from(combined);
  }, [allSockets]);

  // Check if current value is a known socket
  const isKnownSocket = availableSockets.includes(value);

  // Handle select change
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === CUSTOM_SOCKET_VALUE) {
      setIsCustomMode(true);
      setCustomValue(value);
    } else {
      setIsCustomMode(false);
      onChange(selected);
    }
  };

  // Handle custom input submit
  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
    }
    setIsCustomMode(false);
  };

  // Handle custom input cancel
  const handleCustomCancel = () => {
    setIsCustomMode(false);
    setCustomValue("");
  };

  if (isCustomMode) {
    return (
      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCustomSubmit();
            if (e.key === "Escape") handleCustomCancel();
          }}
          placeholder="Socket name"
          title={`Custom ${label} socket`}
          className="w-16 h-8 px-1 text-xs text-center border border-blue-500 rounded bg-white dark:bg-gray-700"
        />
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={handleCustomSubmit}
            className="flex-1 text-[10px] px-1 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            OK
          </button>
          <button
            type="button"
            onClick={handleCustomCancel}
            className="flex-1 text-[10px] px-1 py-0.5 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400"
          >
            X
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={isKnownSocket ? value : CUSTOM_SOCKET_VALUE}
        onChange={handleSelectChange}
        title={`${label} socket`}
        className="w-16 h-8 px-0.5 text-xs text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 cursor-pointer"
      >
        {availableSockets.map((socket) => (
          <option key={socket} value={socket}>
            {socket}
          </option>
        ))}
        <option value={CUSTOM_SOCKET_VALUE}>
          {isKnownSocket ? "Custom..." : value}
        </option>
      </select>
    </div>
  );
}

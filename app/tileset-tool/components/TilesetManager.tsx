"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../../components";
import { DEFAULT_TILE_SIZE, TILE_SIZES } from "../constants";
import { storage } from "../storage";
import type { AdjacencyRule, Tile, TileSize, Tileset } from "../types";
import { TilePicker } from "./TilePicker";
import { TileRuleCard } from "./TileRuleCard";
import { TilesetList } from "./TilesetList";

export function TilesetManager() {
  const [tilesets, setTilesets] = useState<Tileset[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [currentTileset, setCurrentTileset] = useState<Tileset | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTilePicker, setShowTilePicker] = useState(false);
  const [showSocketHelpModal, setShowSocketHelpModal] = useState(false);

  // Load data from storage on mount
  useEffect(() => {
    setTilesets(storage.getTilesets());
    setTiles(storage.getTiles());
  }, []);

  // Collect all unique socket names for autocomplete
  const allSockets = useMemo(() => {
    const sockets = new Set<string>();
    for (const tileset of tilesets) {
      for (const rule of tileset.adjacencyRules) {
        Object.values(rule.sockets).forEach((s) => {
          if (s && s !== "any") sockets.add(s);
        });
      }
    }
    return Array.from(sockets).sort();
  }, [tilesets]);

  // Get tiles that are in the current tileset
  const tilesetTiles = useMemo(() => {
    if (!currentTileset) return [];
    return currentTileset.tileIds
      .map((id) => tiles.find((t) => t.id === id))
      .filter((t): t is Tile => t !== undefined);
  }, [currentTileset, tiles]);

  // Refresh tilesets from storage
  const refreshTilesets = useCallback(() => {
    setTilesets(storage.getTilesets());
  }, []);

  // Select a tileset
  const handleTilesetSelect = useCallback((tileset: Tileset) => {
    setCurrentTileset(tileset);
  }, []);

  // Delete a tileset
  const handleTilesetDelete = useCallback(
    (id: string) => {
      storage.deleteTileset(id);
      refreshTilesets();
      if (currentTileset?.id === id) {
        setCurrentTileset(null);
      }
    },
    [currentTileset, refreshTilesets],
  );

  // Rename a tileset
  const handleTilesetRename = useCallback(
    (id: string, name: string) => {
      const tileset = storage.getTileset(id);
      if (tileset) {
        storage.saveTileset({ ...tileset, name });
        refreshTilesets();
        if (currentTileset?.id === id) {
          setCurrentTileset({ ...currentTileset, name });
        }
      }
    },
    [currentTileset, refreshTilesets],
  );

  // Create a new tileset
  const handleCreateTileset = useCallback(
    (name: string, tileSize: TileSize) => {
      const now = Date.now();
      const tileset: Tileset = {
        id: storage.generateTilesetId(),
        name,
        tileSize,
        tileIds: [],
        adjacencyRules: [],
        createdAt: now,
        updatedAt: now,
      };
      storage.saveTileset(tileset);
      refreshTilesets();
      setCurrentTileset(tileset);
      setShowCreateModal(false);
    },
    [refreshTilesets],
  );

  // Toggle tile in tileset
  const handleTileToggle = useCallback(
    (tileId: string) => {
      if (!currentTileset) return;

      let newTileIds: string[];
      let newRules: AdjacencyRule[];

      if (currentTileset.tileIds.includes(tileId)) {
        // Remove tile
        newTileIds = currentTileset.tileIds.filter((id) => id !== tileId);
        newRules = currentTileset.adjacencyRules.filter(
          (r) => r.tileId !== tileId,
        );
      } else {
        // Add tile with default rule
        newTileIds = [...currentTileset.tileIds, tileId];
        newRules = [
          ...currentTileset.adjacencyRules,
          storage.createDefaultAdjacencyRule(tileId),
        ];
      }

      const updated = {
        ...currentTileset,
        tileIds: newTileIds,
        adjacencyRules: newRules,
      };
      storage.saveTileset(updated);
      setCurrentTileset(updated);
      refreshTilesets();
    },
    [currentTileset, refreshTilesets],
  );

  // Update adjacency rule
  const handleRuleChange = useCallback(
    (rule: AdjacencyRule) => {
      if (!currentTileset) return;

      const newRules = currentTileset.adjacencyRules.map((r) =>
        r.tileId === rule.tileId ? rule : r,
      );

      const updated = { ...currentTileset, adjacencyRules: newRules };
      storage.saveTileset(updated);
      setCurrentTileset(updated);
      refreshTilesets();
    },
    [currentTileset, refreshTilesets],
  );

  // Remove tile from tileset
  const handleRemoveTile = useCallback(
    (tileId: string) => {
      if (!currentTileset) return;

      const updated = {
        ...currentTileset,
        tileIds: currentTileset.tileIds.filter((id) => id !== tileId),
        adjacencyRules: currentTileset.adjacencyRules.filter(
          (r) => r.tileId !== tileId,
        ),
      };
      storage.saveTileset(updated);
      setCurrentTileset(updated);
      refreshTilesets();
    },
    [currentTileset, refreshTilesets],
  );

  // Export tileset as JSON
  const handleExportJSON = useCallback(() => {
    if (!currentTileset) return;

    const exportData = {
      tileset: currentTileset,
      tiles: tilesetTiles,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentTileset.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentTileset, tilesetTiles]);

  // Export tileset as PNG sprite sheet
  const handleExportPNG = useCallback(() => {
    if (!currentTileset || tilesetTiles.length === 0) return;

    const tileSize = currentTileset.tileSize;
    const cols = Math.ceil(Math.sqrt(tilesetTiles.length));
    const rows = Math.ceil(tilesetTiles.length / cols);

    const canvas = document.createElement("canvas");
    canvas.width = cols * tileSize;
    canvas.height = rows * tileSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw each tile
    tilesetTiles.forEach((tile, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const offsetX = col * tileSize;
      const offsetY = row * tileSize;

      for (let y = 0; y < tileSize; y++) {
        for (let x = 0; x < tileSize; x++) {
          const color = tile.pixels[y]?.[x];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(offsetX + x, offsetY + y, 1, 1);
          }
        }
      }
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${currentTileset.name}-spritesheet.png`;
    link.click();
  }, [currentTileset, tilesetTiles]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left sidebar - Tileset list */}
      <div className="lg:w-64 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tilesets
          </h3>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            New
          </button>
        </div>
        <TilesetList
          tilesets={tilesets}
          selectedTilesetId={currentTileset?.id || null}
          onTilesetSelect={handleTilesetSelect}
          onTilesetDelete={handleTilesetDelete}
          onTilesetRename={handleTilesetRename}
        />
      </div>

      {/* Main content */}
      <div className="flex-1">
        {currentTileset ? (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTilePicker(true)}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Add/Remove Tiles
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={handleExportPNG}
                disabled={tilesetTiles.length === 0}
                className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Export Sprite Sheet
              </button>
              <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                {currentTileset.tileSize}x{currentTileset.tileSize} |{" "}
                {tilesetTiles.length} tiles
              </div>
            </div>

            {/* Tile rules */}
            {tilesetTiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium mb-2">No tiles in tileset</p>
                <p className="text-sm mb-4">
                  Add tiles to start defining adjacency rules.
                </p>
                <button
                  type="button"
                  onClick={() => setShowTilePicker(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Tiles
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Adjacency Rules
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowSocketHelpModal(true)}
                    className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    title="How socket matching works"
                  >
                    ?
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Define which tile edges can connect. Tiles with matching
                  socket names on adjacent edges can be placed next to each
                  other. Use &quot;any&quot; to match with any socket.{" "}
                  <button
                    type="button"
                    onClick={() => setShowSocketHelpModal(true)}
                    className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 underline"
                  >
                    Learn more
                  </button>
                </p>
                <div className="space-y-3">
                  {tilesetTiles.map((tile) => {
                    const rule = currentTileset.adjacencyRules.find(
                      (r) => r.tileId === tile.id,
                    );
                    if (!rule) return null;
                    return (
                      <TileRuleCard
                        key={tile.id}
                        tile={tile}
                        rule={rule}
                        allSockets={allSockets}
                        onRuleChange={handleRuleChange}
                        onRemove={() => handleRemoveTile(tile.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium mb-2">No tileset selected</p>
            <p className="text-sm">
              Select a tileset from the list or create a new one.
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateTilesetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTileset}
        existingTilesets={tilesets}
      />

      {/* Tile Picker Modal */}
      {currentTileset && (
        <Modal
          isOpen={showTilePicker}
          onClose={() => setShowTilePicker(false)}
          title="Select Tiles"
        >
          <div className="p-4">
            <TilePicker
              tiles={tiles}
              selectedTileIds={currentTileset.tileIds}
              tileSize={currentTileset.tileSize}
              onTileToggle={handleTileToggle}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTilePicker(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Socket Help Modal */}
      <SocketHelpModal
        isOpen={showSocketHelpModal}
        onClose={() => setShowSocketHelpModal(false)}
      />
    </div>
  );
}

// Create Tileset Modal
type CreateTilesetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, tileSize: TileSize) => void;
  existingTilesets: Tileset[];
};

function CreateTilesetModal({
  isOpen,
  onClose,
  onCreate,
  existingTilesets,
}: CreateTilesetModalProps) {
  const [name, setName] = useState("");
  const [tileSize, setTileSize] = useState<TileSize>(DEFAULT_TILE_SIZE);

  useEffect(() => {
    if (isOpen) {
      setName(storage.generateTilesetName(existingTilesets));
      setTileSize(DEFAULT_TILE_SIZE);
    }
  }, [isOpen, existingTilesets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), tileSize);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Tileset">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label
            htmlFor="tileset-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Name
          </label>
          <input
            id="tileset-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label
            htmlFor="tileset-size"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Tile Size
          </label>
          <select
            id="tileset-size"
            value={tileSize}
            onChange={(e) => setTileSize(Number(e.target.value) as TileSize)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          >
            {TILE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}x{size} pixels
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Only tiles of this size can be added to this tileset.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Socket Help Modal
type SocketHelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function SocketHelpModal({ isOpen, onClose }: SocketHelpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How Socket Matching Works">
      <div className="p-4 space-y-4 max-w-lg">
        <section>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            What are Sockets?
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sockets are labels assigned to each edge of a tile (top, right,
            bottom, left). They define which tiles can be placed next to each
            other in Wave Function Collapse (WFC) generation.
          </p>
        </section>

        <section>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            How Matching Works
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Two tiles can be placed adjacent to each other if their touching
            edges have <strong>matching socket names</strong>:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm font-mono">
            <div className="flex items-center gap-2 justify-center">
              <div className="border border-gray-400 dark:border-gray-500 p-2 text-center">
                <div className="text-xs text-gray-500">Tile A</div>
                <div className="text-blue-600 dark:text-blue-400">
                  right: &quot;edge-a&quot;
                </div>
              </div>
              <div className="text-green-600 dark:text-green-400 font-bold">
                =
              </div>
              <div className="border border-gray-400 dark:border-gray-500 p-2 text-center">
                <div className="text-xs text-gray-500">Tile B</div>
                <div className="text-blue-600 dark:text-blue-400">
                  left: &quot;edge-a&quot;
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Special Socket: &quot;any&quot;
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The{" "}
            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
              any
            </code>{" "}
            socket is a wildcard that matches with{" "}
            <strong>any other socket</strong>, including other &quot;any&quot;
            sockets. Use this for tiles that can connect to anything.
          </p>
        </section>

        <section>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Common Socket Patterns
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                ground
              </code>{" "}
              /{" "}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                sky
              </code>{" "}
              - For platformer-style top/bottom edges
            </li>
            <li>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                edge-a
              </code>
              ,{" "}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                edge-b
              </code>
              ,{" "}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                edge-c
              </code>{" "}
              - For distinct edge types
            </li>
            <li>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                wall
              </code>{" "}
              /{" "}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                open
              </code>{" "}
              - For room/dungeon generation
            </li>
            <li>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                corner
              </code>{" "}
              - For corner pieces that connect specifically
            </li>
          </ul>
        </section>

        <section>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Tips
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li>Give similar-looking edges the same socket name</li>
            <li>Use descriptive names that reflect the visual appearance</li>
            <li>
              The <strong>Weight</strong> controls how often a tile appears in
              generation
            </li>
            <li>
              Enable <strong>Rotatable</strong> for symmetric tiles to increase
              variety
            </li>
          </ul>
        </section>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}

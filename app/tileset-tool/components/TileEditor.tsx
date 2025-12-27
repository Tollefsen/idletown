"use client";

import { useCallback, useEffect, useState } from "react";
import {
  COLOR_PALETTE,
  DEFAULT_COLOR_INDEX,
  DEFAULT_TILE_SIZE,
  DEFAULT_ZOOM_INDEX,
  MAX_HISTORY_SIZE,
  ZOOM_LEVELS,
} from "../constants";
import { storage } from "../storage";
import type { DrawTool, HistoryEntry, Tile, TileSize } from "../types";
import { ColorPalette } from "./ColorPalette";
import { TileCanvas } from "./TileCanvas";
import { TileList } from "./TileList";
import { TileSizeSelector } from "./TileSizeSelector";
import { ToolPalette } from "./ToolPalette";

export function TileEditor() {
  // Tile state
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [currentTile, setCurrentTile] = useState<Tile | null>(null);
  const [pixels, setPixels] = useState<string[][]>(() =>
    storage.createEmptyPixels(DEFAULT_TILE_SIZE),
  );
  const [tileSize, setTileSize] = useState<TileSize>(DEFAULT_TILE_SIZE);

  // Editor state
  const [selectedColor, setSelectedColor] = useState<string>(
    COLOR_PALETTE[DEFAULT_COLOR_INDEX].hex,
  );
  const [selectedTool, setSelectedTool] = useState<DrawTool>("pencil");
  const [showGrid, setShowGrid] = useState(true);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [pendingChanges, setPendingChanges] = useState(false);

  const zoom = ZOOM_LEVELS[tileSize][zoomIndex];
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Reset history helper
  const resetHistory = useCallback((newPixels: string[][]) => {
    const initialEntry: HistoryEntry = {
      pixels: newPixels.map((row) => [...row]),
      timestamp: Date.now(),
    };
    setHistory([initialEntry]);
    setHistoryIndex(0);
  }, []);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPixels(history[newIndex].pixels.map((row) => [...row]));
    }
  }, [historyIndex, history]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPixels(history[newIndex].pixels.map((row) => [...row]));
    }
  }, [historyIndex, history]);

  // Load tiles from storage on mount
  useEffect(() => {
    setTiles(storage.getTiles());
  }, []);

  // Save initial state to history
  useEffect(() => {
    if (history.length === 0) {
      const initialEntry: HistoryEntry = {
        pixels: pixels.map((row) => [...row]),
        timestamp: Date.now(),
      };
      setHistory([initialEntry]);
      setHistoryIndex(0);
    }
  }, [history.length, pixels]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Tool shortcuts
      if (key === "p") setSelectedTool("pencil");
      if (key === "e") setSelectedTool("eraser");
      if (key === "f") setSelectedTool("fill");
      if (key === "i") setSelectedTool("eyedropper");

      // Grid toggle
      if (key === "g") setShowGrid((prev) => !prev);

      // Undo/redo
      if ((e.ctrlKey || e.metaKey) && key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }

      // Zoom
      if (key === "+" || key === "=") {
        setZoomIndex((prev) =>
          Math.min(prev + 1, ZOOM_LEVELS[tileSize].length - 1),
        );
      }
      if (key === "-") {
        setZoomIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tileSize, handleUndo, handleRedo]);

  // Handle pixel change
  const handlePixelChange = useCallback(
    (x: number, y: number, color: string) => {
      setPixels((prev) => {
        const newPixels = prev.map((row) => [...row]);
        newPixels[y][x] = color;
        return newPixels;
      });
      setPendingChanges(true);
    },
    [],
  );

  // Handle draw end - save to history
  const handleDrawEnd = useCallback(() => {
    if (!pendingChanges) return;

    setHistory((prev) => {
      // Remove any redo history
      const newHistory = prev.slice(0, historyIndex + 1);

      // Add new entry
      const entry: HistoryEntry = {
        pixels: pixels.map((row) => [...row]),
        timestamp: Date.now(),
      };
      newHistory.push(entry);

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        return newHistory;
      }

      return newHistory;
    });

    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
    setPendingChanges(false);
  }, [pendingChanges, pixels, historyIndex]);

  // Color pick from eyedropper
  const handleColorPick = useCallback((color: string) => {
    setSelectedColor(color);
    setSelectedTool("pencil");
  }, []);

  // Create new tile
  const handleNewTile = useCallback(() => {
    setCurrentTile(null);
    const emptyPixels = storage.createEmptyPixels(tileSize);
    setPixels(emptyPixels);
    resetHistory(emptyPixels);
  }, [tileSize, resetHistory]);

  // Save current tile
  const handleSave = useCallback(() => {
    const now = Date.now();
    const tile: Tile = currentTile
      ? {
          ...currentTile,
          pixels: pixels.map((row) => [...row]),
          updatedAt: now,
        }
      : {
          id: storage.generateId(),
          name: storage.generateTileName(tiles),
          size: tileSize,
          pixels: pixels.map((row) => [...row]),
          createdAt: now,
          updatedAt: now,
        };

    storage.saveTile(tile);
    setTiles(storage.getTiles());
    setCurrentTile(tile);
  }, [currentTile, pixels, tileSize, tiles]);

  // Load a tile
  const handleTileSelect = useCallback(
    (tile: Tile) => {
      setCurrentTile(tile);
      setTileSize(tile.size);
      setPixels(tile.pixels.map((row) => [...row]));
      setZoomIndex(DEFAULT_ZOOM_INDEX);
      resetHistory(tile.pixels);
    },
    [resetHistory],
  );

  // Delete a tile
  const handleTileDelete = useCallback(
    (id: string) => {
      storage.deleteTile(id);
      setTiles(storage.getTiles());
      if (currentTile?.id === id) {
        handleNewTile();
      }
    },
    [currentTile, handleNewTile],
  );

  // Rename a tile
  const handleTileRename = useCallback((id: string, name: string) => {
    const tile = storage.getTile(id);
    if (tile) {
      const updated = { ...tile, name, updatedAt: Date.now() };
      storage.saveTile(updated);
      setTiles(storage.getTiles());
    }
  }, []);

  // Change tile size (only for new tiles)
  const handleSizeChange = useCallback(
    (size: TileSize) => {
      setTileSize(size);
      const emptyPixels = storage.createEmptyPixels(size);
      setPixels(emptyPixels);
      setZoomIndex(DEFAULT_ZOOM_INDEX);
      setCurrentTile(null);
      resetHistory(emptyPixels);
    },
    [resetHistory],
  );

  // Export as PNG
  const handleExport = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw pixels
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const color = pixels[y]?.[x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Download
    const link = document.createElement("a");
    link.download = `${currentTile?.name || "tile"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [pixels, tileSize, currentTile]);

  // Clear canvas
  const handleClear = useCallback(() => {
    if (confirm("Clear the canvas? This cannot be undone.")) {
      const emptyPixels = storage.createEmptyPixels(tileSize);
      setPixels(emptyPixels);
      resetHistory(emptyPixels);
    }
  }, [tileSize, resetHistory]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left sidebar - Tools & Colors */}
      <div className="lg:w-48 space-y-6">
        <ToolPalette
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
        />
        <ColorPalette
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
        <TileSizeSelector
          size={tileSize}
          onSizeChange={handleSizeChange}
          disabled={currentTile !== null}
        />
      </div>

      {/* Main canvas area */}
      <div className="flex-1 flex flex-col items-center gap-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleNewTile}
            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            New
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Export PNG
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Clear
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            Redo
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded"
            />
            Grid (G)
          </label>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoomIndex((prev) => Math.max(prev - 1, 0))}
              disabled={zoomIndex === 0}
              className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              title="Zoom out (-)"
            >
              -
            </button>
            <span className="text-sm w-12 text-center">{zoom}x</span>
            <button
              type="button"
              onClick={() =>
                setZoomIndex((prev) =>
                  Math.min(prev + 1, ZOOM_LEVELS[tileSize].length - 1),
                )
              }
              disabled={zoomIndex === ZOOM_LEVELS[tileSize].length - 1}
              className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              title="Zoom in (+)"
            >
              +
            </button>
          </div>
        </div>

        {/* Current tile info */}
        {currentTile && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Editing: <span className="font-medium">{currentTile.name}</span>
          </div>
        )}

        {/* Canvas */}
        <TileCanvas
          pixels={pixels}
          size={tileSize}
          zoom={zoom}
          showGrid={showGrid}
          selectedColor={selectedColor}
          tool={selectedTool}
          onPixelChange={handlePixelChange}
          onColorPick={handleColorPick}
          onDrawEnd={handleDrawEnd}
        />

        {/* Keyboard shortcuts help */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Shortcuts: P/E/F/I = tools | G = grid | +/- = zoom | Ctrl+Z/Shift+Z =
          undo/redo
        </div>
      </div>

      {/* Right sidebar - Saved tiles */}
      <div className="lg:w-56">
        <TileList
          tiles={tiles}
          selectedTileId={currentTile?.id || null}
          onTileSelect={handleTileSelect}
          onTileDelete={handleTileDelete}
          onTileRename={handleTileRename}
        />
      </div>
    </div>
  );
}

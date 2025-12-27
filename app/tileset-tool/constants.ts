import type { TileSize } from "./types";

// Available tile size presets
export const TILE_SIZES: TileSize[] = [8, 16, 32, 64];

// Default tile size for new tiles
export const DEFAULT_TILE_SIZE: TileSize = 16;

// 16-color palette inspired by PICO-8
export const COLOR_PALETTE = [
  { name: "Black", hex: "#000000" },
  { name: "Dark Blue", hex: "#1D2B53" },
  { name: "Dark Purple", hex: "#7E2553" },
  { name: "Dark Green", hex: "#008751" },
  { name: "Brown", hex: "#AB5236" },
  { name: "Dark Gray", hex: "#5F574F" },
  { name: "Light Gray", hex: "#C2C3C7" },
  { name: "White", hex: "#FFF1E8" },
  { name: "Red", hex: "#FF004D" },
  { name: "Orange", hex: "#FFA300" },
  { name: "Yellow", hex: "#FFEC27" },
  { name: "Green", hex: "#00E436" },
  { name: "Blue", hex: "#29ADFF" },
  { name: "Indigo", hex: "#83769C" },
  { name: "Pink", hex: "#FF77A8" },
  { name: "Peach", hex: "#FFCCAA" },
] as const;

// Default color for new drawings (index 0 = black)
export const DEFAULT_COLOR_INDEX = 0;

// Zoom levels based on tile size for comfortable editing
export const ZOOM_LEVELS: Record<TileSize, number[]> = {
  8: [16, 24, 32, 40, 48],
  16: [12, 16, 20, 24, 32],
  32: [8, 10, 12, 16, 20],
  64: [4, 6, 8, 10, 12],
};

// Default zoom level index (middle of the array)
export const DEFAULT_ZOOM_INDEX = 2;

// Maximum history entries for undo/redo
export const MAX_HISTORY_SIZE = 50;

// Grid line color
export const GRID_COLOR = "rgba(128, 128, 128, 0.3)";

// Transparent background pattern colors
export const TRANSPARENT_PATTERN_LIGHT = "#FFFFFF";
export const TRANSPARENT_PATTERN_DARK = "#CCCCCC";

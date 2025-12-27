// Supported tile sizes in pixels
export type TileSize = 8 | 16 | 32 | 64;

// Available drawing tools
export type DrawTool = "pencil" | "eraser" | "fill" | "eyedropper";

// A single tile
export interface Tile {
  id: string;
  name: string;
  size: TileSize;
  pixels: string[][]; // 2D array of hex colors, empty string = transparent
  createdAt: number;
  updatedAt: number;
}

// Tileset grouping tiles together (Phase 2)
export interface Tileset {
  id: string;
  name: string;
  tileSize: TileSize;
  tileIds: string[];
  adjacencyRules: AdjacencyRule[];
  createdAt: number;
  updatedAt: number;
}

// Socket-based adjacency rules for WFC (Phase 2)
export interface AdjacencyRule {
  tileId: string;
  sockets: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  rotatable: boolean;
  weight: number; // Probability weight for WFC
}

// Level data structure (Phase 3)
export interface Level {
  id: string;
  name: string;
  width: number;
  height: number;
  tilesetId: string;
  layers: LevelLayer[];
  createdAt: number;
  updatedAt: number;
}

export interface LevelLayer {
  name: string;
  tiles: (string | null)[][]; // Tile IDs or null for empty
}

// History entry for undo/redo
export interface HistoryEntry {
  pixels: string[][];
  timestamp: number;
}

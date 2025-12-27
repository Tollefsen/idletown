import type { AdjacencyRule, Tile, TileSize, Tileset } from "./types";

const STORAGE_KEY = "tileset-tool-tiles";
const TILESET_STORAGE_KEY = "tileset-tool-tilesets";
const CURRENT_VERSION = 1;

interface StorageData {
  version: number;
  tiles: Tile[];
}

interface TilesetStorageData {
  version: number;
  tilesets: Tileset[];
}

export interface TileStorageAdapter {
  // Tile operations
  getTiles(): Tile[];
  getTile(id: string): Tile | undefined;
  saveTile(tile: Tile): void;
  deleteTile(id: string): void;
  generateId(): string;
  generateTileName(existingTiles: Tile[]): string;
  createEmptyPixels(size: TileSize): string[][];

  // Tileset operations
  getTilesets(): Tileset[];
  getTileset(id: string): Tileset | undefined;
  saveTileset(tileset: Tileset): void;
  deleteTileset(id: string): void;
  generateTilesetId(): string;
  generateTilesetName(existingTilesets: Tileset[]): string;
  createDefaultAdjacencyRule(tileId: string): AdjacencyRule;
}

class LocalStorageAdapter implements TileStorageAdapter {
  private initialized = false;
  private tilesetInitialized = false;

  // ============ Tile Storage ============

  private ensureInitialized(): void {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (!parsed.version || parsed.version < CURRENT_VERSION) {
          this.migrateTiles();
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    this.initialized = true;
  }

  private migrateTiles(): void {
    const newData: StorageData = {
      version: CURRENT_VERSION,
      tiles: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }

  private getData(): StorageData {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { version: CURRENT_VERSION, tiles: [] };
      }
      return JSON.parse(data);
    } catch {
      return { version: CURRENT_VERSION, tiles: [] };
    }
  }

  private setData(data: StorageData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getTiles(): Tile[] {
    return this.getData().tiles;
  }

  getTile(id: string): Tile | undefined {
    return this.getTiles().find((t) => t.id === id);
  }

  saveTile(tile: Tile): void {
    const data = this.getData();
    const index = data.tiles.findIndex((t) => t.id === tile.id);

    if (index >= 0) {
      data.tiles[index] = { ...tile, updatedAt: Date.now() };
    } else {
      data.tiles.push(tile);
    }

    this.setData(data);
  }

  deleteTile(id: string): void {
    const data = this.getData();
    data.tiles = data.tiles.filter((t) => t.id !== id);
    this.setData(data);
  }

  generateId(): string {
    return `tile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  generateTileName(existingTiles: Tile[]): string {
    let counter = 1;
    const existingNames = new Set(existingTiles.map((t) => t.name));

    while (existingNames.has(`Tile ${counter}`)) {
      counter++;
    }

    return `Tile ${counter}`;
  }

  createEmptyPixels(size: TileSize): string[][] {
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ""),
    );
  }

  // ============ Tileset Storage ============

  private ensureTilesetInitialized(): void {
    if (this.tilesetInitialized) return;
    if (typeof window === "undefined") return;

    const data = localStorage.getItem(TILESET_STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (!parsed.version || parsed.version < CURRENT_VERSION) {
          this.migrateTilesets();
        }
      } catch {
        localStorage.removeItem(TILESET_STORAGE_KEY);
      }
    }

    this.tilesetInitialized = true;
  }

  private migrateTilesets(): void {
    const newData: TilesetStorageData = {
      version: CURRENT_VERSION,
      tilesets: [],
    };
    localStorage.setItem(TILESET_STORAGE_KEY, JSON.stringify(newData));
  }

  private getTilesetData(): TilesetStorageData {
    this.ensureTilesetInitialized();
    try {
      const data = localStorage.getItem(TILESET_STORAGE_KEY);
      if (!data) {
        return { version: CURRENT_VERSION, tilesets: [] };
      }
      return JSON.parse(data);
    } catch {
      return { version: CURRENT_VERSION, tilesets: [] };
    }
  }

  private setTilesetData(data: TilesetStorageData): void {
    localStorage.setItem(TILESET_STORAGE_KEY, JSON.stringify(data));
  }

  getTilesets(): Tileset[] {
    return this.getTilesetData().tilesets;
  }

  getTileset(id: string): Tileset | undefined {
    return this.getTilesets().find((t) => t.id === id);
  }

  saveTileset(tileset: Tileset): void {
    const data = this.getTilesetData();
    const index = data.tilesets.findIndex((t) => t.id === tileset.id);

    if (index >= 0) {
      data.tilesets[index] = { ...tileset, updatedAt: Date.now() };
    } else {
      data.tilesets.push(tileset);
    }

    this.setTilesetData(data);
  }

  deleteTileset(id: string): void {
    const data = this.getTilesetData();
    data.tilesets = data.tilesets.filter((t) => t.id !== id);
    this.setTilesetData(data);
  }

  generateTilesetId(): string {
    return `tileset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  generateTilesetName(existingTilesets: Tileset[]): string {
    let counter = 1;
    const existingNames = new Set(existingTilesets.map((t) => t.name));

    while (existingNames.has(`Tileset ${counter}`)) {
      counter++;
    }

    return `Tileset ${counter}`;
  }

  createDefaultAdjacencyRule(tileId: string): AdjacencyRule {
    return {
      tileId,
      sockets: {
        top: "any",
        right: "any",
        bottom: "any",
        left: "any",
      },
      rotatable: false,
      weight: 1,
    };
  }
}

export const storage: TileStorageAdapter = new LocalStorageAdapter();

import { beforeEach, describe, expect, it } from "vitest";
import { storage } from "./storage";
import type { Tile, Tileset } from "./types";

describe("TileStorageAdapter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("generateId", () => {
    it("should generate unique IDs", () => {
      const id1 = storage.generateId();
      const id2 = storage.generateId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^tile-\d+-[a-z0-9]+$/);
    });
  });

  describe("generateTileName", () => {
    it("should generate 'Tile 1' for empty list", () => {
      const name = storage.generateTileName([]);
      expect(name).toBe("Tile 1");
    });

    it("should generate next available name", () => {
      const existingTiles = [
        { name: "Tile 1" },
        { name: "Tile 2" },
        { name: "Tile 4" },
      ] as Tile[];

      const name = storage.generateTileName(existingTiles);
      expect(name).toBe("Tile 3");
    });

    it("should handle gaps in numbering", () => {
      const existingTiles = [{ name: "Tile 5" }, { name: "Tile 10" }] as Tile[];

      const name = storage.generateTileName(existingTiles);
      expect(name).toBe("Tile 1");
    });
  });

  describe("createEmptyPixels", () => {
    it("should create 8x8 empty grid", () => {
      const pixels = storage.createEmptyPixels(8);

      expect(pixels).toHaveLength(8);
      expect(pixels[0]).toHaveLength(8);
      expect(pixels.every((row) => row.every((cell) => cell === ""))).toBe(
        true,
      );
    });

    it("should create 16x16 empty grid", () => {
      const pixels = storage.createEmptyPixels(16);

      expect(pixels).toHaveLength(16);
      expect(pixels[0]).toHaveLength(16);
    });

    it("should create 64x64 empty grid", () => {
      const pixels = storage.createEmptyPixels(64);

      expect(pixels).toHaveLength(64);
      expect(pixels[0]).toHaveLength(64);
    });
  });

  describe("CRUD operations", () => {
    it("should return empty array when no tiles exist", () => {
      const tiles = storage.getTiles();
      expect(tiles).toEqual([]);
    });

    it("should save and retrieve a tile", () => {
      const tile: Tile = {
        id: "test-tile-1",
        name: "Test Tile",
        size: 16,
        pixels: storage.createEmptyPixels(16),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveTile(tile);
      const tiles = storage.getTiles();

      expect(tiles).toHaveLength(1);
      expect(tiles[0].id).toBe("test-tile-1");
      expect(tiles[0].name).toBe("Test Tile");
    });

    it("should get a single tile by ID", () => {
      const tile: Tile = {
        id: "test-tile-2",
        name: "Another Tile",
        size: 32,
        pixels: storage.createEmptyPixels(32),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveTile(tile);
      const retrieved = storage.getTile("test-tile-2");

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Another Tile");
    });

    it("should return undefined for non-existent tile", () => {
      const tile = storage.getTile("non-existent");
      expect(tile).toBeUndefined();
    });

    it("should update an existing tile", () => {
      const tile: Tile = {
        id: "test-tile-3",
        name: "Original Name",
        size: 16,
        pixels: storage.createEmptyPixels(16),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveTile(tile);

      const updatedTile = { ...tile, name: "Updated Name" };
      storage.saveTile(updatedTile);

      const tiles = storage.getTiles();
      expect(tiles).toHaveLength(1);
      expect(tiles[0].name).toBe("Updated Name");
    });

    it("should delete a tile", () => {
      const tile: Tile = {
        id: "test-tile-4",
        name: "To Delete",
        size: 16,
        pixels: storage.createEmptyPixels(16),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveTile(tile);
      expect(storage.getTiles()).toHaveLength(1);

      storage.deleteTile("test-tile-4");
      expect(storage.getTiles()).toHaveLength(0);
    });

    it("should handle deleting non-existent tile gracefully", () => {
      storage.deleteTile("non-existent");
      expect(storage.getTiles()).toEqual([]);
    });
  });

  describe("pixel data integrity", () => {
    it("should preserve pixel data after save and retrieve", () => {
      const pixels = storage.createEmptyPixels(8);
      pixels[0][0] = "#FF0000";
      pixels[3][5] = "#00FF00";
      pixels[7][7] = "#0000FF";

      const tile: Tile = {
        id: "pixel-test",
        name: "Pixel Test",
        size: 8,
        pixels,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveTile(tile);
      const retrieved = storage.getTile("pixel-test");

      expect(retrieved?.pixels[0][0]).toBe("#FF0000");
      expect(retrieved?.pixels[3][5]).toBe("#00FF00");
      expect(retrieved?.pixels[7][7]).toBe("#0000FF");
      expect(retrieved?.pixels[1][1]).toBe("");
    });
  });
});

describe("TilesetStorageAdapter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("generateTilesetId", () => {
    it("should generate unique IDs", () => {
      const id1 = storage.generateTilesetId();
      const id2 = storage.generateTilesetId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^tileset-\d+-[a-z0-9]+$/);
    });
  });

  describe("generateTilesetName", () => {
    it("should generate 'Tileset 1' for empty list", () => {
      const name = storage.generateTilesetName([]);
      expect(name).toBe("Tileset 1");
    });

    it("should generate next available name", () => {
      const existingTilesets = [
        { name: "Tileset 1" },
        { name: "Tileset 2" },
        { name: "Tileset 4" },
      ] as Tileset[];

      const name = storage.generateTilesetName(existingTilesets);
      expect(name).toBe("Tileset 3");
    });
  });

  describe("createDefaultAdjacencyRule", () => {
    it("should create rule with default sockets", () => {
      const rule = storage.createDefaultAdjacencyRule("tile-1");

      expect(rule.tileId).toBe("tile-1");
      expect(rule.sockets.top).toBe("any");
      expect(rule.sockets.right).toBe("any");
      expect(rule.sockets.bottom).toBe("any");
      expect(rule.sockets.left).toBe("any");
      expect(rule.rotatable).toBe(false);
      expect(rule.weight).toBe(1);
    });
  });

  describe("CRUD operations", () => {
    it("should return empty array when no tilesets exist", () => {
      const tilesets = storage.getTilesets();
      expect(tilesets).toEqual([]);
    });

    it("should save and retrieve a tileset", () => {
      const tileset: Tileset = {
        id: "test-tileset-1",
        name: "Test Tileset",
        tileSize: 16,
        tileIds: ["tile-1", "tile-2"],
        adjacencyRules: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveTileset(tileset);
      const tilesets = storage.getTilesets();

      expect(tilesets).toHaveLength(1);
      expect(tilesets[0].id).toBe("test-tileset-1");
      expect(tilesets[0].name).toBe("Test Tileset");
      expect(tilesets[0].tileIds).toEqual(["tile-1", "tile-2"]);
    });

    it("should get a single tileset by ID", () => {
      const tileset: Tileset = {
        id: "test-tileset-2",
        name: "Another Tileset",
        tileSize: 32,
        tileIds: [],
        adjacencyRules: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveTileset(tileset);
      const retrieved = storage.getTileset("test-tileset-2");

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Another Tileset");
    });

    it("should return undefined for non-existent tileset", () => {
      const tileset = storage.getTileset("non-existent");
      expect(tileset).toBeUndefined();
    });

    it("should update an existing tileset", () => {
      const tileset: Tileset = {
        id: "test-tileset-3",
        name: "Original Name",
        tileSize: 16,
        tileIds: [],
        adjacencyRules: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveTileset(tileset);

      const updatedTileset = {
        ...tileset,
        name: "Updated Name",
        tileIds: ["tile-1"],
      };
      storage.saveTileset(updatedTileset);

      const tilesets = storage.getTilesets();
      expect(tilesets).toHaveLength(1);
      expect(tilesets[0].name).toBe("Updated Name");
      expect(tilesets[0].tileIds).toEqual(["tile-1"]);
    });

    it("should delete a tileset", () => {
      const tileset: Tileset = {
        id: "test-tileset-4",
        name: "To Delete",
        tileSize: 16,
        tileIds: [],
        adjacencyRules: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveTileset(tileset);
      expect(storage.getTilesets()).toHaveLength(1);

      storage.deleteTileset("test-tileset-4");
      expect(storage.getTilesets()).toHaveLength(0);
    });

    it("should handle deleting non-existent tileset gracefully", () => {
      storage.deleteTileset("non-existent");
      expect(storage.getTilesets()).toEqual([]);
    });
  });

  describe("adjacency rules integrity", () => {
    it("should preserve adjacency rules after save and retrieve", () => {
      const tileset: Tileset = {
        id: "rules-test",
        name: "Rules Test",
        tileSize: 16,
        tileIds: ["tile-1"],
        adjacencyRules: [
          {
            tileId: "tile-1",
            sockets: {
              top: "grass",
              right: "dirt",
              bottom: "water",
              left: "sand",
            },
            rotatable: true,
            weight: 2.5,
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      storage.saveTileset(tileset);
      const retrieved = storage.getTileset("rules-test");

      expect(retrieved?.adjacencyRules).toHaveLength(1);
      expect(retrieved?.adjacencyRules[0].sockets.top).toBe("grass");
      expect(retrieved?.adjacencyRules[0].sockets.right).toBe("dirt");
      expect(retrieved?.adjacencyRules[0].sockets.bottom).toBe("water");
      expect(retrieved?.adjacencyRules[0].sockets.left).toBe("sand");
      expect(retrieved?.adjacencyRules[0].rotatable).toBe(true);
      expect(retrieved?.adjacencyRules[0].weight).toBe(2.5);
    });
  });
});

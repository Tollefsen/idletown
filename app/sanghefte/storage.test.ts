import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "../config/constants";
import { pamphletStorage } from "./storage";
import type { StoredPamphlet } from "./types";

describe("PamphletStorageAdapter", () => {
  beforeEach(() => {
    localStorage.clear();
    (pamphletStorage as unknown as { initialized: boolean }).initialized =
      false;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getPamphlets", () => {
    it("should return empty array when no pamphlets exist", () => {
      const result = pamphletStorage.getPamphlets();

      expect(result).toEqual([]);
    });

    it("should return stored pamphlets", () => {
      const pamphlets: StoredPamphlet[] = [
        {
          id: "1",
          name: "Test Pamphlet",
          songs: [],
          createdAt: 1000,
          updatedAt: 1000,
        },
      ];
      localStorage.setItem(
        STORAGE_KEYS.sangheftePamphlets,
        JSON.stringify(pamphlets),
      );

      const result = pamphletStorage.getPamphlets();

      expect(result).toEqual(pamphlets);
    });

    it("should return empty array when data is corrupted", () => {
      localStorage.setItem(STORAGE_KEYS.sangheftePamphlets, "invalid-json{");

      const result = pamphletStorage.getPamphlets();

      expect(result).toEqual([]);
    });
  });

  describe("getPamphlet", () => {
    it("should return null when pamphlet does not exist", () => {
      const result = pamphletStorage.getPamphlet("nonexistent");

      expect(result).toBeNull();
    });

    it("should return pamphlet by id", () => {
      const pamphlet: StoredPamphlet = {
        id: "1",
        name: "Test",
        songs: [{ title: "Song 1", lyrics: "La la la" }],
        createdAt: 1000,
        updatedAt: 1000,
      };
      localStorage.setItem(
        STORAGE_KEYS.sangheftePamphlets,
        JSON.stringify([pamphlet]),
      );

      const result = pamphletStorage.getPamphlet("1");

      expect(result).toEqual(pamphlet);
    });
  });

  describe("savePamphlet", () => {
    it("should save new pamphlet", () => {
      const pamphlet: StoredPamphlet = {
        id: "1",
        name: "Test",
        songs: [],
        createdAt: 1000,
        updatedAt: 1000,
      };

      pamphletStorage.savePamphlet(pamphlet);

      const stored = pamphletStorage.getPamphlets();
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe("Test");
    });

    it("should update existing pamphlet", () => {
      const original: StoredPamphlet = {
        id: "1",
        name: "Original",
        songs: [],
        createdAt: 1000,
        updatedAt: 1000,
      };
      const updated: StoredPamphlet = {
        id: "1",
        name: "Updated",
        songs: [{ title: "New Song", lyrics: "New lyrics" }],
        createdAt: 1000,
        updatedAt: 2000,
      };

      pamphletStorage.savePamphlet(original);
      pamphletStorage.savePamphlet(updated);

      const result = pamphletStorage.getPamphlets();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Updated");
      expect(result[0].songs).toHaveLength(1);
    });

    it("should update updatedAt timestamp on save", () => {
      const pamphlet: StoredPamphlet = {
        id: "1",
        name: "Test",
        songs: [],
        createdAt: 1000,
        updatedAt: 1000,
      };

      pamphletStorage.savePamphlet(pamphlet);

      const result = pamphletStorage.getPamphlet("1");
      expect(result?.updatedAt).toBeGreaterThan(1000);
    });

    it("should add pamphlet without replacing others", () => {
      const pamphlet1: StoredPamphlet = {
        id: "1",
        name: "Pamphlet 1",
        songs: [],
        createdAt: 1000,
        updatedAt: 1000,
      };
      const pamphlet2: StoredPamphlet = {
        id: "2",
        name: "Pamphlet 2",
        songs: [],
        createdAt: 2000,
        updatedAt: 2000,
      };

      pamphletStorage.savePamphlet(pamphlet1);
      pamphletStorage.savePamphlet(pamphlet2);

      const result = pamphletStorage.getPamphlets();
      expect(result).toHaveLength(2);
    });
  });

  describe("deletePamphlet", () => {
    it("should delete pamphlet by id", () => {
      const pamphlet: StoredPamphlet = {
        id: "1",
        name: "Test",
        songs: [],
        createdAt: 1000,
        updatedAt: 1000,
      };

      pamphletStorage.savePamphlet(pamphlet);
      pamphletStorage.deletePamphlet("1");

      const result = pamphletStorage.getPamphlets();
      expect(result).toEqual([]);
    });

    it("should not affect other pamphlets when deleting", () => {
      const pamphlet1: StoredPamphlet = {
        id: "1",
        name: "Pamphlet 1",
        songs: [],
        createdAt: 1000,
        updatedAt: 1000,
      };
      const pamphlet2: StoredPamphlet = {
        id: "2",
        name: "Pamphlet 2",
        songs: [],
        createdAt: 2000,
        updatedAt: 2000,
      };

      pamphletStorage.savePamphlet(pamphlet1);
      pamphletStorage.savePamphlet(pamphlet2);
      pamphletStorage.deletePamphlet("1");

      const result = pamphletStorage.getPamphlets();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });
  });

  describe("createPamphlet", () => {
    it("should create and save a new pamphlet", () => {
      const result = pamphletStorage.createPamphlet("New Pamphlet");

      expect(result.name).toBe("New Pamphlet");
      expect(result.songs).toEqual([]);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      const stored = pamphletStorage.getPamphlet(result.id);
      expect(stored).toEqual(result);
    });
  });
});

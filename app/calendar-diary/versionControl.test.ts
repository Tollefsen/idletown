import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VersionControl } from "./versionControl";

describe("VersionControl", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("initialize", () => {
    it("should set current version when no stored version exists", () => {
      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 2,
        supportedVersions: [1, 2],
        migrations: {},
      });

      vc.initialize();

      expect(localStorage.getItem("test-key-version")).toBe("2");
    });

    it("should keep version when stored version is current", () => {
      localStorage.setItem("test-key-version", "2");
      localStorage.setItem("test-key", JSON.stringify(["data"]));

      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 2,
        supportedVersions: [1, 2],
        migrations: {},
      });

      vc.initialize();

      expect(localStorage.getItem("test-key-version")).toBe("2");
      expect(localStorage.getItem("test-key")).toBe(JSON.stringify(["data"]));
    });

    it("should clear data when stored version is unsupported", () => {
      localStorage.setItem("test-key-version", "5");
      localStorage.setItem("test-key", JSON.stringify(["old-data"]));

      const onClear = vi.fn();
      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 2,
        supportedVersions: [1, 2],
        migrations: {},
      });

      vc.initialize(onClear);

      expect(onClear).toHaveBeenCalledOnce();
      expect(localStorage.getItem("test-key-version")).toBe("2");
    });

    it("should log warning when clearing unsupported version", () => {
      localStorage.setItem("test-key-version", "999");
      const consoleWarn = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 2,
        supportedVersions: [1, 2],
        migrations: {},
      });

      vc.initialize();

      expect(consoleWarn).toHaveBeenCalledWith(
        "Unsupported data version 999 for test-key. Clearing old data.",
      );
      consoleWarn.mockRestore();
    });

    it("should migrate data when stored version is older", () => {
      localStorage.setItem("test-key-version", "1");
      localStorage.setItem("test-key", JSON.stringify([{ old: "data" }]));

      const migration = vi.fn((_data) => [{ new: "data", migrated: true }]);

      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 2,
        supportedVersions: [1, 2],
        migrations: {
          2: migration,
        },
      });

      vc.initialize();

      expect(migration).toHaveBeenCalledWith([{ old: "data" }]);
      expect(localStorage.getItem("test-key")).toBe(
        JSON.stringify([{ new: "data", migrated: true }]),
      );
      expect(localStorage.getItem("test-key-version")).toBe("2");
    });

    it("should apply multiple migrations in sequence", () => {
      localStorage.setItem("test-key-version", "1");
      localStorage.setItem("test-key", JSON.stringify([{ version: 1 }]));

      const migration2 = vi.fn((data) => [...data, { version: 2 }]);
      const migration3 = vi.fn((data) => [...data, { version: 3 }]);

      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 3,
        supportedVersions: [1, 2, 3],
        migrations: {
          2: migration2,
          3: migration3,
        },
      });

      vc.initialize();

      expect(migration2).toHaveBeenCalledWith([{ version: 1 }]);
      expect(migration3).toHaveBeenCalledWith([{ version: 1 }, { version: 2 }]);
      expect(localStorage.getItem("test-key-version")).toBe("3");
    });

    it("should skip migrations without handlers", () => {
      localStorage.setItem("test-key-version", "1");
      localStorage.setItem("test-key", JSON.stringify([{ data: "original" }]));

      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 3,
        supportedVersions: [1, 2, 3],
        migrations: {},
      });

      vc.initialize();

      const stored = localStorage.getItem("test-key");
      expect(stored).toBe(JSON.stringify([{ data: "original" }]));
      expect(localStorage.getItem("test-key-version")).toBe("3");
    });

    it("should handle corrupted data gracefully during migration", () => {
      localStorage.setItem("test-key-version", "1");
      localStorage.setItem("test-key", "invalid-json{");

      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 2,
        supportedVersions: [1, 2],
        migrations: {
          2: (data) => data,
        },
      });

      vc.initialize();

      expect(localStorage.getItem("test-key-version")).toBe("2");
    });

    it("should return empty array when data is missing", () => {
      localStorage.setItem("test-key-version", "1");

      const migration = vi.fn((data) => {
        expect(data).toEqual([]);
        return [{ migrated: true }];
      });

      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 2,
        supportedVersions: [1, 2],
        migrations: {
          2: migration,
        },
      });

      vc.initialize();

      expect(migration).toHaveBeenCalledWith([]);
    });

    it("should handle numeric version strings correctly", () => {
      localStorage.setItem("test-key-version", "001");
      localStorage.setItem("test-key", JSON.stringify(["data"]));

      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 2,
        supportedVersions: [1, 2],
        migrations: {
          2: (data) => data,
        },
      });

      vc.initialize();

      expect(localStorage.getItem("test-key-version")).toBe("2");
    });

    it("should not call onClear when version is supported", () => {
      localStorage.setItem("test-key-version", "1");
      const onClear = vi.fn();

      const vc = new VersionControl({
        storageKey: "test-key",
        currentVersion: 1,
        supportedVersions: [1],
        migrations: {},
      });

      vc.initialize(onClear);

      expect(onClear).not.toHaveBeenCalled();
    });
  });
});

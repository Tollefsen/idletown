import { VersionControl } from "../calendar-diary/versionControl";
import { STORAGE_KEYS } from "../config/constants";
import type { StoredPamphlet } from "./types";

const CURRENT_VERSION = 1;
const SUPPORTED_VERSIONS = [1];

class PamphletStorageAdapter {
  private STORAGE_KEY = STORAGE_KEYS.sangheftePamphlets;
  private versionControl: VersionControl<StoredPamphlet[]> | null = null;
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    this.versionControl = new VersionControl({
      storageKey: this.STORAGE_KEY,
      currentVersion: CURRENT_VERSION,
      supportedVersions: SUPPORTED_VERSIONS,
      migrations: {},
    });

    this.versionControl.initialize(() => {
      localStorage.removeItem(this.STORAGE_KEY);
    });

    this.initialized = true;
  }

  private getPamphletsRaw(): StoredPamphlet[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getPamphlets(): StoredPamphlet[] {
    this.ensureInitialized();
    return this.getPamphletsRaw();
  }

  getPamphlet(id: string): StoredPamphlet | null {
    this.ensureInitialized();
    return this.getPamphletsRaw().find((p) => p.id === id) || null;
  }

  savePamphlet(pamphlet: StoredPamphlet): void {
    this.ensureInitialized();
    const pamphlets = this.getPamphlets();
    const index = pamphlets.findIndex((p) => p.id === pamphlet.id);

    const updatedPamphlet = {
      ...pamphlet,
      updatedAt: Date.now(),
    };

    if (index >= 0) {
      pamphlets[index] = updatedPamphlet;
    } else {
      pamphlets.push(updatedPamphlet);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pamphlets));
  }

  deletePamphlet(id: string): void {
    this.ensureInitialized();
    const pamphlets = this.getPamphlets().filter((p) => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pamphlets));
  }

  createPamphlet(name: string): StoredPamphlet {
    const now = Date.now();
    const pamphlet: StoredPamphlet = {
      id: now.toString(),
      name,
      songs: [],
      createdAt: now,
      updatedAt: now,
    };

    this.savePamphlet(pamphlet);
    return pamphlet;
  }
}

export const pamphletStorage = new PamphletStorageAdapter();

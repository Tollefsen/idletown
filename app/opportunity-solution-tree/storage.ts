import type { OstNode, OstTree } from "./types";

const STORAGE_KEY = "ost-trees";
const CURRENT_VERSION = 1;

export function createDefaultTree(): OstTree {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "Untitled Tree",
    nodes: [
      {
        id: crypto.randomUUID(),
        type: "outcome",
        label: "Desired Outcome",
        x: 400,
        y: 80,
        parentId: null,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export function createNode(
  type: OstNode["type"],
  x: number,
  y: number,
  parentId: string | null,
): OstNode {
  return {
    id: crypto.randomUUID(),
    type,
    label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    x,
    y,
    parentId,
  };
}

function getDescendantIds(nodes: OstNode[], nodeId: string): string[] {
  const children = nodes.filter((n) => n.parentId === nodeId);
  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    ids.push(...getDescendantIds(nodes, child.id));
  }
  return ids;
}

export function removeNodeAndDescendants(
  nodes: OstNode[],
  nodeId: string,
): OstNode[] {
  const idsToRemove = new Set([nodeId, ...getDescendantIds(nodes, nodeId)]);
  return nodes.filter((n) => !idsToRemove.has(n.id));
}

class LocalStorageAdapter {
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    if (typeof window === "undefined") return;

    const versionKey = `${STORAGE_KEY}-version`;
    const storedVersion = localStorage.getItem(versionKey);

    if (!storedVersion) {
      localStorage.setItem(versionKey, String(CURRENT_VERSION));
    } else if (Number(storedVersion) < CURRENT_VERSION) {
      localStorage.setItem(versionKey, String(CURRENT_VERSION));
    }

    this.initialized = true;
  }

  private getTreesRaw(): OstTree[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getTrees(): OstTree[] {
    this.ensureInitialized();
    return this.getTreesRaw();
  }

  getTree(id: string): OstTree | undefined {
    return this.getTrees().find((t) => t.id === id);
  }

  saveTree(tree: OstTree): void {
    this.ensureInitialized();
    const trees = this.getTrees();
    const index = trees.findIndex((t) => t.id === tree.id);

    const updatedTree: OstTree = {
      ...tree,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      trees[index] = updatedTree;
    } else {
      trees.push(updatedTree);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
  }

  deleteTree(id: string): void {
    this.ensureInitialized();
    const trees = this.getTrees().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
  }
}

export const storage = new LocalStorageAdapter();

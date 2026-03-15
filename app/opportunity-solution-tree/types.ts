export const OST_NODE_TYPES = [
  "outcome",
  "opportunity",
  "solution",
  "experiment",
] as const;

export type OstNodeType = (typeof OST_NODE_TYPES)[number];

export interface OstNode {
  id: string;
  type: OstNodeType;
  label: string;
  x: number;
  y: number;
  parentId: string | null;
}

export interface OstTree {
  id: string;
  name: string;
  nodes: OstNode[];
  createdAt: string;
  updatedAt: string;
}

export const VALID_CHILDREN: Record<OstNodeType, OstNodeType[]> = {
  outcome: ["opportunity"],
  opportunity: ["solution"],
  solution: ["experiment"],
  experiment: [],
};

export const NODE_COLORS: Record<
  OstNodeType,
  { bg: string; bgDark: string; text: string }
> = {
  outcome: { bg: "#3b82f6", bgDark: "#2563eb", text: "#ffffff" },
  opportunity: { bg: "#f59e0b", bgDark: "#d97706", text: "#ffffff" },
  solution: { bg: "#10b981", bgDark: "#059669", text: "#ffffff" },
  experiment: { bg: "#8b5cf6", bgDark: "#7c3aed", text: "#ffffff" },
};

export const NODE_TYPE_LABELS: Record<OstNodeType, string> = {
  outcome: "Outcome",
  opportunity: "Opportunity",
  solution: "Solution",
  experiment: "Experiment",
};

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 60;
export const NODE_RADIUS = 8;
export const CONNECTOR_RADIUS = 6;

export type CanvasMode = "select" | "add" | "connect";

export interface CanvasState {
  offsetX: number;
  offsetY: number;
  zoom: number;
  selectedNodeId: string | null;
  mode: CanvasMode;
  addNodeType: OstNodeType | null;
}

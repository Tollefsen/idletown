"use client";

import { BackLink } from "../../components";
import type { CanvasMode, OstNodeType } from "../types";
import { NODE_COLORS, NODE_TYPE_LABELS, OST_NODE_TYPES } from "../types";

interface ToolbarProps {
  treeName: string;
  mode: CanvasMode;
  addNodeType: OstNodeType | null;
  selectedNodeId: string | null;
  onSetMode: (mode: CanvasMode, addNodeType?: OstNodeType | null) => void;
  onDelete: () => void;
  onTreeNameChange: (name: string) => void;
}

export function Toolbar({
  treeName,
  mode,
  addNodeType,
  selectedNodeId,
  onSetMode,
  onDelete,
  onTreeNameChange,
}: ToolbarProps) {
  return (
    <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center px-4 gap-3 shrink-0">
      <BackLink />

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

      <input
        type="text"
        value={treeName}
        onChange={(e) => onTreeNameChange(e.target.value)}
        className="text-sm font-medium bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 w-40 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors"
      />

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

      <div className="flex items-center gap-1.5">
        {OST_NODE_TYPES.map((nodeType) => {
          const isActive = mode === "add" && addNodeType === nodeType;
          return (
            <button
              key={nodeType}
              type="button"
              onClick={() => {
                if (isActive) {
                  onSetMode("select", null);
                } else {
                  onSetMode("add", nodeType);
                }
              }}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                isActive
                  ? "text-white ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-900 scale-105 shadow-md"
                  : "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              style={
                isActive
                  ? { backgroundColor: NODE_COLORS[nodeType].bg }
                  : undefined
              }
            >
              + {NODE_TYPE_LABELS[nodeType]}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {selectedNodeId && (
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-1.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
        >
          Delete
        </button>
      )}
    </div>
  );
}

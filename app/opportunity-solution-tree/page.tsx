"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { useCanvasState } from "./components/useCanvasState";
import { createDefaultTree, storage } from "./storage";
import type { OstTree } from "./types";

const SAVE_DEBOUNCE_MS = 500;

export default function OpportunitySolutionTreePage() {
  const [tree, setTree] = useState<OstTree | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trees = storage.getTrees();
    if (trees.length > 0) {
      setTree(trees[0]);
    } else {
      const newTree = createDefaultTree();
      storage.saveTree(newTree);
      setTree(newTree);
    }
  }, []);

  const handleTreeChange = useCallback((updated: OstTree) => {
    setTree(updated);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      storage.saveTree(updated);
    }, SAVE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  if (!tree) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return <OstEditor tree={tree} onTreeChange={handleTreeChange} />;
}

function OstEditor({
  tree,
  onTreeChange,
}: {
  tree: OstTree;
  onTreeChange: (tree: OstTree) => void;
}) {
  const actions = useCanvasState(tree, onTreeChange);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      <Toolbar
        treeName={tree.name}
        mode={actions.canvas.mode}
        addNodeType={actions.canvas.addNodeType}
        selectedNodeId={actions.canvas.selectedNodeId}
        onSetMode={actions.setMode}
        onDelete={actions.deleteSelected}
        onTreeNameChange={actions.setTreeName}
      />

      <Canvas tree={tree} actions={actions} />

      {actions.toast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm shadow-lg animate-fade-in">
          {actions.toast}
        </div>
      )}
    </div>
  );
}

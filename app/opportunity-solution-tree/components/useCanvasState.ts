import { useCallback, useEffect, useRef, useState } from "react";
import { createNode, removeNodeAndDescendants } from "../storage";
import type {
  CanvasMode,
  CanvasState,
  OstNode,
  OstNodeType,
  OstTree,
} from "../types";
import {
  CONNECTOR_RADIUS,
  NODE_HEIGHT,
  NODE_WIDTH,
  VALID_CHILDREN,
} from "../types";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

interface EditingState {
  nodeId: string;
  value: string;
}

interface ConnectingState {
  sourceNodeId: string;
  currentX: number;
  currentY: number;
}

export function useCanvasState(
  tree: OstTree,
  onTreeChange: (tree: OstTree) => void,
) {
  const [canvas, setCanvas] = useState<CanvasState>({
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    selectedNodeId: null,
    mode: "select",
    addNodeType: null,
  });

  const [editing, setEditing] = useState<EditingState | null>(null);
  const [connecting, setConnecting] = useState<ConnectingState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => ({
      x: (screenX - canvas.offsetX) / canvas.zoom,
      y: (screenY - canvas.offsetY) / canvas.zoom,
    }),
    [canvas.offsetX, canvas.offsetY, canvas.zoom],
  );

  const hitTestNode = useCallback(
    (canvasX: number, canvasY: number): OstNode | null => {
      for (let i = tree.nodes.length - 1; i >= 0; i--) {
        const node = tree.nodes[i];
        if (
          canvasX >= node.x &&
          canvasX <= node.x + NODE_WIDTH &&
          canvasY >= node.y &&
          canvasY <= node.y + NODE_HEIGHT
        ) {
          return node;
        }
      }
      return null;
    },
    [tree.nodes],
  );

  const hitTestConnector = useCallback(
    (canvasX: number, canvasY: number): OstNode | null => {
      const hitRadius = CONNECTOR_RADIUS * 2.5;
      for (let i = tree.nodes.length - 1; i >= 0; i--) {
        const node = tree.nodes[i];
        const cx = node.x + NODE_WIDTH / 2;
        const cy = node.y + NODE_HEIGHT;
        const dx = canvasX - cx;
        const dy = canvasY - cy;
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          return node;
        }
      }
      return null;
    },
    [tree.nodes],
  );

  const findValidParent = useCallback(
    (nodeType: OstNodeType): OstNode | null => {
      if (!canvas.selectedNodeId) return null;
      const selected = tree.nodes.find((n) => n.id === canvas.selectedNodeId);
      if (!selected) return null;

      const validChildTypes = VALID_CHILDREN[selected.type];
      if (validChildTypes.includes(nodeType)) {
        return selected;
      }
      return null;
    },
    [canvas.selectedNodeId, tree.nodes],
  );

  const addNode = useCallback(
    (canvasX: number, canvasY: number) => {
      if (!canvas.addNodeType) return;

      const nodeType = canvas.addNodeType;

      if (
        nodeType === "outcome" &&
        tree.nodes.some((n) => n.type === "outcome")
      ) {
        showToast("Only one Outcome node allowed per tree");
        return;
      }

      let parentId: string | null = null;

      if (nodeType !== "outcome") {
        const parent = findValidParent(nodeType);
        if (parent) {
          parentId = parent.id;
        } else if (canvas.selectedNodeId) {
          const selected = tree.nodes.find(
            (n) => n.id === canvas.selectedNodeId,
          );
          if (selected) {
            showToast(`Cannot add ${nodeType} as child of ${selected.type}`);
            return;
          }
        }
      }

      const newNode = createNode(
        nodeType,
        canvasX - NODE_WIDTH / 2,
        canvasY - NODE_HEIGHT / 2,
        parentId,
      );

      onTreeChange({
        ...tree,
        nodes: [...tree.nodes, newNode],
      });

      setCanvas((prev) => ({
        ...prev,
        selectedNodeId: newNode.id,
        mode: "select",
        addNodeType: null,
      }));
    },
    [
      canvas.addNodeType,
      canvas.selectedNodeId,
      tree,
      onTreeChange,
      findValidParent,
      showToast,
    ],
  );

  const selectNode = useCallback((nodeId: string | null) => {
    setCanvas((prev) => ({ ...prev, selectedNodeId: nodeId }));
  }, []);

  const startEditing = useCallback(
    (nodeId: string) => {
      const node = tree.nodes.find((n) => n.id === nodeId);
      if (node) {
        setEditing({ nodeId, value: node.label });
      }
    },
    [tree.nodes],
  );

  const commitEdit = useCallback(() => {
    if (!editing) return;
    const trimmed = editing.value.trim();
    if (trimmed) {
      onTreeChange({
        ...tree,
        nodes: tree.nodes.map((n) =>
          n.id === editing.nodeId ? { ...n, label: trimmed } : n,
        ),
      });
    }
    setEditing(null);
  }, [editing, tree, onTreeChange]);

  const cancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const updateEditValue = useCallback((value: string) => {
    setEditing((prev) => (prev ? { ...prev, value } : null));
  }, []);

  const deleteSelected = useCallback(() => {
    if (!canvas.selectedNodeId) return;
    const newNodes = removeNodeAndDescendants(
      tree.nodes,
      canvas.selectedNodeId,
    );
    onTreeChange({ ...tree, nodes: newNodes });
    setCanvas((prev) => ({ ...prev, selectedNodeId: null }));
  }, [canvas.selectedNodeId, tree, onTreeChange]);

  const moveNode = useCallback(
    (nodeId: string, dx: number, dy: number) => {
      onTreeChange({
        ...tree,
        nodes: tree.nodes.map((n) =>
          n.id === nodeId ? { ...n, x: n.x + dx, y: n.y + dy } : n,
        ),
      });
    },
    [tree, onTreeChange],
  );

  const setMode = useCallback(
    (mode: CanvasMode, addNodeType: OstNodeType | null = null) => {
      setCanvas((prev) => ({ ...prev, mode, addNodeType }));
    },
    [],
  );

  const zoom = useCallback(
    (delta: number, centerX: number, centerY: number) => {
      setCanvas((prev) => {
        const sensitivity = 0.002;
        const factor = 1 - delta * sensitivity;
        const clampedFactor = Math.min(1.3, Math.max(0.7, factor));
        const newZoom = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, prev.zoom * clampedFactor),
        );
        const zoomRatio = newZoom / prev.zoom;

        return {
          ...prev,
          zoom: newZoom,
          offsetX: centerX - (centerX - prev.offsetX) * zoomRatio,
          offsetY: centerY - (centerY - prev.offsetY) * zoomRatio,
        };
      });
    },
    [],
  );

  const pan = useCallback((dx: number, dy: number) => {
    setCanvas((prev) => ({
      ...prev,
      offsetX: prev.offsetX + dx,
      offsetY: prev.offsetY + dy,
    }));
  }, []);

  const setZoomLevel = useCallback(
    (newZoom: number, centerX?: number, centerY?: number) => {
      setCanvas((prev) => {
        const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
        if (centerX !== undefined && centerY !== undefined) {
          const zoomRatio = clamped / prev.zoom;
          return {
            ...prev,
            zoom: clamped,
            offsetX: centerX - (centerX - prev.offsetX) * zoomRatio,
            offsetY: centerY - (centerY - prev.offsetY) * zoomRatio,
          };
        }
        return { ...prev, zoom: clamped };
      });
    },
    [],
  );

  const resetView = useCallback(() => {
    setCanvas((prev) => ({ ...prev, offsetX: 0, offsetY: 0, zoom: 1 }));
  }, []);

  const setTreeName = useCallback(
    (name: string) => {
      onTreeChange({ ...tree, name });
    },
    [tree, onTreeChange],
  );

  const startConnecting = useCallback(
    (sourceNodeId: string, canvasX: number, canvasY: number) => {
      setConnecting({ sourceNodeId, currentX: canvasX, currentY: canvasY });
    },
    [],
  );

  const updateConnecting = useCallback((canvasX: number, canvasY: number) => {
    setConnecting((prev) =>
      prev ? { ...prev, currentX: canvasX, currentY: canvasY } : null,
    );
  }, []);

  const finishConnecting = useCallback(
    (targetNodeId: string) => {
      if (!connecting) return;
      const source = tree.nodes.find((n) => n.id === connecting.sourceNodeId);
      const target = tree.nodes.find((n) => n.id === targetNodeId);

      if (!source || !target) {
        setConnecting(null);
        return;
      }

      if (source.id === target.id) {
        setConnecting(null);
        return;
      }

      const validChildTypes = VALID_CHILDREN[source.type];
      if (!validChildTypes.includes(target.type)) {
        showToast(
          `Cannot connect ${source.type} → ${target.type}. Valid children: ${validChildTypes.join(", ") || "none"}`,
        );
        setConnecting(null);
        return;
      }

      if (target.parentId === source.id) {
        showToast("Already connected");
        setConnecting(null);
        return;
      }

      onTreeChange({
        ...tree,
        nodes: tree.nodes.map((n) =>
          n.id === target.id ? { ...n, parentId: source.id } : n,
        ),
      });
      setConnecting(null);
    },
    [connecting, tree, onTreeChange, showToast],
  );

  const cancelConnecting = useCallback(() => {
    setConnecting(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editing) return;

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        canvas.selectedNodeId
      ) {
        e.preventDefault();
        deleteSelected();
      }

      if (e.key === "Escape") {
        setCanvas((prev) => ({
          ...prev,
          mode: "select",
          addNodeType: null,
          selectedNodeId: null,
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas.selectedNodeId, editing, deleteSelected]);

  return {
    canvas,
    editing,
    connecting,
    toast,
    screenToCanvas,
    hitTestNode,
    hitTestConnector,
    addNode,
    selectNode,
    startEditing,
    commitEdit,
    cancelEdit,
    updateEditValue,
    deleteSelected,
    moveNode,
    setMode,
    zoom,
    pan,
    setZoomLevel,
    resetView,
    setTreeName,
    startConnecting,
    updateConnecting,
    finishConnecting,
    cancelConnecting,
  };
}

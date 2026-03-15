"use client";

import { type RefCallback, useCallback, useEffect, useRef } from "react";
import type { OstNode, OstTree } from "../types";
import {
  CONNECTOR_RADIUS,
  NODE_COLORS,
  NODE_HEIGHT,
  NODE_RADIUS,
  NODE_WIDTH,
  VALID_CHILDREN,
} from "../types";
import type { useCanvasState } from "./useCanvasState";
import { ZoomHud } from "./ZoomHud";

type CanvasActions = ReturnType<typeof useCanvasState>;

interface CanvasProps {
  tree: OstTree;
  actions: CanvasActions;
}

const GRID_SIZE = 40;

function getIsDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
  zoom: number,
  isDark: boolean,
) {
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  const scaledGrid = GRID_SIZE * zoom;
  const startX = offsetX % scaledGrid;
  const startY = offsetY % scaledGrid;

  ctx.beginPath();
  for (let x = startX; x < width; x += scaledGrid) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = startY; y < height; y += scaledGrid) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
}

function drawEdge(
  ctx: CanvasRenderingContext2D,
  parent: OstNode,
  child: OstNode,
  zoom: number,
  offsetX: number,
  offsetY: number,
) {
  const px = parent.x * zoom + offsetX + (NODE_WIDTH * zoom) / 2;
  const py = parent.y * zoom + offsetY + NODE_HEIGHT * zoom;
  const cx = child.x * zoom + offsetX + (NODE_WIDTH * zoom) / 2;
  const cy = child.y * zoom + offsetY;

  const midY = (py + cy) / 2;

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.bezierCurveTo(px, midY, cx, midY, cx, cy);
  ctx.stroke();
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: OstNode,
  zoom: number,
  offsetX: number,
  offsetY: number,
  isSelected: boolean,
  isDark: boolean,
) {
  const x = node.x * zoom + offsetX;
  const y = node.y * zoom + offsetY;
  const w = NODE_WIDTH * zoom;
  const h = NODE_HEIGHT * zoom;
  const r = NODE_RADIUS * zoom;
  const colors = NODE_COLORS[node.type];

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = isDark ? colors.bgDark : colors.bg;
  ctx.fill();

  if (isSelected) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3 * zoom;
    ctx.stroke();
    ctx.strokeStyle = isDark ? "#60a5fa" : "#2563eb";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
  }

  ctx.fillStyle = colors.text;
  ctx.font = `${Math.max(10, 14 * zoom)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxChars = Math.floor((NODE_WIDTH - 20) / 8);
  const displayLabel =
    node.label.length > maxChars
      ? `${node.label.slice(0, maxChars - 1)}...`
      : node.label;

  ctx.fillText(displayLabel, x + w / 2, y + h / 2, w - 16 * zoom);
}

function drawConnectorHandle(
  ctx: CanvasRenderingContext2D,
  node: OstNode,
  zoom: number,
  offsetX: number,
  offsetY: number,
  isDark: boolean,
) {
  if (VALID_CHILDREN[node.type].length === 0) return;

  const cx = node.x * zoom + offsetX + (NODE_WIDTH * zoom) / 2;
  const cy = node.y * zoom + offsetY + NODE_HEIGHT * zoom;
  const r = CONNECTOR_RADIUS * zoom;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? "#475569" : "#cbd5e1";
  ctx.fill();
  ctx.strokeStyle = isDark ? "#64748b" : "#94a3b8";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  ctx.beginPath();
  const plus = r * 0.5;
  ctx.moveTo(cx - plus, cy);
  ctx.lineTo(cx + plus, cy);
  ctx.moveTo(cx, cy - plus);
  ctx.lineTo(cx, cy + plus);
  ctx.strokeStyle = isDark ? "#94a3b8" : "#64748b";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
}

function drawConnectingLine(
  ctx: CanvasRenderingContext2D,
  sourceNode: OstNode,
  targetX: number,
  targetY: number,
  zoom: number,
  offsetX: number,
  offsetY: number,
) {
  const sx = sourceNode.x * zoom + offsetX + (NODE_WIDTH * zoom) / 2;
  const sy = sourceNode.y * zoom + offsetY + NODE_HEIGHT * zoom;
  const tx = targetX * zoom + offsetX;
  const ty = targetY * zoom + offsetY;
  const midY = (sy + ty) / 2;

  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([6 * zoom, 4 * zoom]);
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.bezierCurveTo(sx, midY, tx, midY, tx, ty);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawEmptyHint(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isDark: boolean,
) {
  ctx.fillStyle = isDark ? "#64748b" : "#94a3b8";
  ctx.font = "16px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Click a node type above to start building your tree",
    width / 2,
    height / 2,
  );
}

export function Canvas({ tree, actions }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const isPanning = useRef(false);
  const isConnecting = useRef(false);
  const dragNodeId = useRef<string | null>(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number>(0);
  const editInputRef: RefCallback<HTMLInputElement> = useCallback((el) => {
    el?.focus();
  }, []);

  const {
    canvas,
    editing,
    connecting,
    screenToCanvas,
    hitTestNode,
    hitTestConnector,
    addNode,
    selectNode,
    startEditing,
    moveNode,
    zoom,
    pan,
    setZoomLevel,
    resetView,
    startConnecting,
    updateConnecting,
    finishConnecting,
    cancelConnecting,
  } = actions;

  const render = useCallback(() => {
    const cvs = canvasRef.current;
    const container = containerRef.current;
    if (!cvs || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (cvs.width !== width * dpr || cvs.height !== height * dpr) {
      cvs.width = width * dpr;
      cvs.height = height * dpr;
      cvs.style.width = `${width}px`;
      cvs.style.height = `${height}px`;
    }

    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isDark = getIsDarkMode();
    ctx.fillStyle = isDark ? "#0f172a" : "#ffffff";
    ctx.fillRect(0, 0, width, height);

    drawGrid(
      ctx,
      width,
      height,
      canvas.offsetX,
      canvas.offsetY,
      canvas.zoom,
      isDark,
    );

    if (tree.nodes.length === 0) {
      drawEmptyHint(ctx, width, height, isDark);
      return;
    }

    const nodeMap = new Map(tree.nodes.map((n) => [n.id, n]));
    for (const node of tree.nodes) {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          drawEdge(
            ctx,
            parent,
            node,
            canvas.zoom,
            canvas.offsetX,
            canvas.offsetY,
          );
        }
      }
    }

    for (const node of tree.nodes) {
      drawNode(
        ctx,
        node,
        canvas.zoom,
        canvas.offsetX,
        canvas.offsetY,
        node.id === canvas.selectedNodeId,
        isDark,
      );
      drawConnectorHandle(
        ctx,
        node,
        canvas.zoom,
        canvas.offsetX,
        canvas.offsetY,
        isDark,
      );
    }

    if (connecting) {
      const sourceNode = tree.nodes.find(
        (n) => n.id === connecting.sourceNodeId,
      );
      if (sourceNode) {
        drawConnectingLine(
          ctx,
          sourceNode,
          connecting.currentX,
          connecting.currentY,
          canvas.zoom,
          canvas.offsetX,
          canvas.offsetY,
        );
      }
    }
  }, [
    tree.nodes,
    canvas.offsetX,
    canvas.offsetY,
    canvas.zoom,
    canvas.selectedNodeId,
    connecting,
  ]);

  useEffect(() => {
    const loop = () => {
      render();
      animFrame.current = requestAnimationFrame(loop);
    };
    animFrame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame.current);
  }, [render]);

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent) => {
      const cvs = canvasRef.current;
      if (!cvs) return { x: 0, y: 0, screenX: 0, screenY: 0 };
      const rect = cvs.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x, y } = screenToCanvas(screenX, screenY);
      return { x, y, screenX, screenY };
    },
    [screenToCanvas],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const { x, y, screenX, screenY } = getCanvasCoords(e);
      lastMouse.current = { x: screenX, y: screenY };

      if (canvas.mode === "add") {
        addNode(x, y);
        return;
      }

      const connectorHit = hitTestConnector(x, y);
      if (connectorHit) {
        isConnecting.current = true;
        startConnecting(connectorHit.id, x, y);
        return;
      }

      const hit = hitTestNode(x, y);
      if (hit) {
        selectNode(hit.id);
        isDragging.current = true;
        dragNodeId.current = hit.id;
      } else {
        selectNode(null);
        isPanning.current = true;
      }
    },
    [
      canvas.mode,
      getCanvasCoords,
      hitTestNode,
      hitTestConnector,
      selectNode,
      addNode,
      startConnecting,
    ],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const rect = cvs.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const dx = screenX - lastMouse.current.x;
      const dy = screenY - lastMouse.current.y;
      lastMouse.current = { x: screenX, y: screenY };

      if (isConnecting.current) {
        const { x, y } = screenToCanvas(screenX, screenY);
        updateConnecting(x, y);
        return;
      }

      if (isDragging.current && dragNodeId.current) {
        moveNode(dragNodeId.current, dx / canvas.zoom, dy / canvas.zoom);
      } else if (isPanning.current) {
        pan(dx, dy);
      }
    },
    [canvas.zoom, moveNode, pan, screenToCanvas, updateConnecting],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isConnecting.current) {
        const { x, y } = getCanvasCoords(e);
        const target = hitTestNode(x, y);
        if (target) {
          finishConnecting(target.id);
        } else {
          cancelConnecting();
        }
        isConnecting.current = false;
      }
      isDragging.current = false;
      isPanning.current = false;
      dragNodeId.current = null;
    },
    [getCanvasCoords, hitTestNode, finishConnecting, cancelConnecting],
  );

  const handleMouseLeave = useCallback(() => {
    if (isConnecting.current) {
      cancelConnecting();
      isConnecting.current = false;
    }
    isDragging.current = false;
    isPanning.current = false;
    dragNodeId.current = null;
  }, [cancelConnecting]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = getCanvasCoords(e);
      const hit = hitTestNode(x, y);
      if (hit) {
        startEditing(hit.id);
      }
    },
    [getCanvasCoords, hitTestNode, startEditing],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const cvs = canvasRef.current;
      if (!cvs) return;
      const rect = cvs.getBoundingClientRect();
      zoom(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
    },
    [zoom],
  );

  const getCursor = () => {
    if (canvas.mode === "add") return "crosshair";
    if (isPanning.current) return "grabbing";
    return "grab";
  };

  const editingNode = editing
    ? tree.nodes.find((n) => n.id === editing.nodeId)
    : null;

  const handleZoomIn = useCallback(() => {
    setZoomLevel(canvas.zoom * 1.25);
  }, [canvas.zoom, setZoomLevel]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(canvas.zoom * 0.8);
  }, [canvas.zoom, setZoomLevel]);

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      />
      <ZoomHud
        zoom={canvas.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={resetView}
      />
      {editing && editingNode && (
        <input
          type="text"
          value={editing.value}
          onChange={(e) => actions.updateEditValue(e.target.value)}
          onBlur={actions.commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") actions.commitEdit();
            if (e.key === "Escape") actions.cancelEdit();
          }}
          className="absolute bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-blue-500 rounded px-2 py-1 text-sm outline-none"
          style={{
            left: editingNode.x * canvas.zoom + canvas.offsetX,
            top: editingNode.y * canvas.zoom + canvas.offsetY,
            width: NODE_WIDTH * canvas.zoom,
            height: NODE_HEIGHT * canvas.zoom,
            fontSize: Math.max(10, 14 * canvas.zoom),
            textAlign: "center",
          }}
          ref={editInputRef}
        />
      )}
    </div>
  );
}

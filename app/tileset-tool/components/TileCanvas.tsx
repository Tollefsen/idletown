import { useCallback, useEffect, useRef } from "react";
import {
  GRID_COLOR,
  TRANSPARENT_PATTERN_DARK,
  TRANSPARENT_PATTERN_LIGHT,
} from "../constants";
import type { DrawTool, TileSize } from "../types";

type TileCanvasProps = {
  pixels: string[][];
  size: TileSize;
  zoom: number;
  showGrid: boolean;
  selectedColor: string;
  tool: DrawTool;
  onPixelChange: (x: number, y: number, color: string) => void;
  onColorPick: (color: string) => void;
  onDrawEnd: () => void;
};

export function TileCanvas({
  pixels,
  size,
  zoom,
  showGrid,
  selectedColor,
  tool,
  onPixelChange,
  onColorPick,
  onDrawEnd,
}: TileCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPixelRef = useRef<{ x: number; y: number } | null>(null);

  const canvasSize = size * zoom;

  // Draw the canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw checkerboard pattern for transparency
    const patternSize = zoom / 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const px = x * zoom;
        const py = y * zoom;

        // Draw checkerboard pattern
        for (let py2 = 0; py2 < 2; py2++) {
          for (let px2 = 0; px2 < 2; px2++) {
            const isLight = (px2 + py2) % 2 === 0;
            ctx.fillStyle = isLight
              ? TRANSPARENT_PATTERN_LIGHT
              : TRANSPARENT_PATTERN_DARK;
            ctx.fillRect(
              px + px2 * patternSize,
              py + py2 * patternSize,
              patternSize,
              patternSize,
            );
          }
        }

        // Draw pixel color if set
        const color = pixels[y]?.[x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(px, py, zoom, zoom);
        }
      }
    }

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;

      for (let i = 0; i <= size; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * zoom + 0.5, 0);
        ctx.lineTo(i * zoom + 0.5, canvasSize);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * zoom + 0.5);
        ctx.lineTo(canvasSize, i * zoom + 0.5);
        ctx.stroke();
      }
    }
  }, [pixels, size, zoom, showGrid, canvasSize]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Convert canvas coordinates to pixel coordinates
  const getPixelCoords = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX: number;
      let clientY: number;

      if ("touches" in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = Math.floor(((clientX - rect.left) * scaleX) / zoom);
      const y = Math.floor(((clientY - rect.top) * scaleY) / zoom);

      if (x < 0 || x >= size || y < 0 || y >= size) return null;

      return { x, y };
    },
    [zoom, size],
  );

  // Flood fill algorithm
  const floodFill = useCallback(
    (startX: number, startY: number, fillColor: string) => {
      const targetColor = pixels[startY]?.[startX] ?? "";

      // Don't fill if clicking on same color
      if (targetColor === fillColor) return;

      const stack: [number, number][] = [[startX, startY]];
      const visited = new Set<string>();

      while (stack.length > 0) {
        const popped = stack.pop();
        if (!popped) continue;
        const [x, y] = popped;
        const key = `${x},${y}`;

        if (visited.has(key)) continue;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;

        const currentColor = pixels[y]?.[x] ?? "";
        if (currentColor !== targetColor) continue;

        visited.add(key);
        onPixelChange(x, y, fillColor);

        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    },
    [pixels, size, onPixelChange],
  );

  // Handle tool action at pixel
  const handleToolAction = useCallback(
    (x: number, y: number) => {
      switch (tool) {
        case "pencil":
          onPixelChange(x, y, selectedColor);
          break;
        case "eraser":
          onPixelChange(x, y, "");
          break;
        case "fill":
          floodFill(x, y, selectedColor);
          break;
        case "eyedropper": {
          const color = pixels[y]?.[x];
          if (color) {
            onColorPick(color);
          }
          break;
        }
      }
    },
    [tool, selectedColor, onPixelChange, floodFill, pixels, onColorPick],
  );

  const handlePointerDown = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      e.preventDefault();
      const coords = getPixelCoords(e);
      if (!coords) return;

      isDrawingRef.current = true;
      lastPixelRef.current = coords;
      handleToolAction(coords.x, coords.y);
    },
    [getPixelCoords, handleToolAction],
  );

  const handlePointerMove = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      if (!isDrawingRef.current) return;
      if (tool === "fill" || tool === "eyedropper") return;

      const coords = getPixelCoords(e);
      if (!coords) return;

      // Avoid redundant updates
      if (
        lastPixelRef.current?.x === coords.x &&
        lastPixelRef.current?.y === coords.y
      ) {
        return;
      }

      lastPixelRef.current = coords;
      handleToolAction(coords.x, coords.y);
    },
    [getPixelCoords, handleToolAction, tool],
  );

  const handlePointerUp = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPixelRef.current = null;
      onDrawEnd();
    }
  }, [onDrawEnd]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="border border-gray-300 dark:border-gray-600 cursor-crosshair touch-none"
      style={{ imageRendering: "pixelated" }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    />
  );
}

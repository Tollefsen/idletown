import { describe, it, expect, vi } from "vitest";
import {
  encodeStrokes,
  decodeStrokes,
  drawStroke,
  redrawCanvas,
  getCanvasPoint,
} from "./utils";
import type { Stroke } from "./types";

describe("encodeStrokes", () => {
  it("should encode strokes to base64 string", () => {
    const strokes: Stroke[] = [
      [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ],
    ];

    const result = encodeStrokes(strokes);

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should sample every 3rd point to reduce data size", () => {
    const strokes: Stroke[] = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 },
        { x: 5, y: 5 },
      ],
    ];

    const result = encodeStrokes(strokes);
    const decoded = decodeStrokes(result);

    expect(decoded[0].length).toBeLessThan(strokes[0].length);
    expect(decoded[0][0]).toEqual({ x: 0, y: 0 });
  });

  it("should round coordinates to integers", () => {
    const strokes: Stroke[] = [[{ x: 10.7, y: 20.3 }]];

    const result = encodeStrokes(strokes);
    const decoded = decodeStrokes(result);

    expect(decoded[0][0]).toEqual({ x: 11, y: 20 });
  });

  it("should handle empty strokes array", () => {
    const strokes: Stroke[] = [];

    const result = encodeStrokes(strokes);

    expect(result).toBeTruthy();
  });
});

describe("decodeStrokes", () => {
  it("should decode base64 string back to strokes", () => {
    const originalStrokes: Stroke[] = [
      [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ],
    ];
    const encoded = encodeStrokes(originalStrokes);

    const result = decodeStrokes(encoded);

    expect(result).toHaveLength(1);
    expect(result[0].length).toBeGreaterThan(0);
  });

  it("should return empty array for invalid encoded string", () => {
    const result = decodeStrokes("invalid-base64");

    expect(result).toEqual([]);
  });

  it("should return empty array for empty string", () => {
    const result = decodeStrokes("");

    expect(result).toEqual([]);
  });

  it("should correctly round-trip encode and decode", () => {
    const strokes: Stroke[] = [
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ],
      [
        { x: 50, y: 50 },
        { x: 150, y: 150 },
      ],
    ];
    const encoded = encodeStrokes(strokes);

    const decoded = decodeStrokes(encoded);

    expect(decoded).toHaveLength(2);
  });
});

describe("drawStroke", () => {
  it("should not draw stroke with less than 2 points", () => {
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const stroke: Stroke = [{ x: 10, y: 20 }];

    drawStroke(ctx, stroke);

    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it("should draw stroke with 2 or more points", () => {
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const stroke: Stroke = [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ];

    drawStroke(ctx, stroke);

    expect(ctx.beginPath).toHaveBeenCalledOnce();
    expect(ctx.moveTo).toHaveBeenCalledWith(10, 20);
    expect(ctx.lineTo).toHaveBeenCalledTimes(2);
    expect(ctx.stroke).toHaveBeenCalledOnce();
  });

  it("should call lineTo for each point after the first", () => {
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const stroke: Stroke = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ];

    drawStroke(ctx, stroke);

    expect(ctx.lineTo).toHaveBeenNthCalledWith(1, 10, 10);
    expect(ctx.lineTo).toHaveBeenNthCalledWith(2, 20, 20);
  });
});

describe("redrawCanvas", () => {
  it("should clear canvas and redraw all strokes", () => {
    const canvas = {
      width: 800,
      height: 600,
      getContext: vi.fn(),
    } as unknown as HTMLCanvasElement;
    const ctx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      strokeStyle: "",
      lineWidth: 0,
      lineCap: "",
      lineJoin: "",
    } as unknown as CanvasRenderingContext2D;
    vi.mocked(canvas.getContext).mockReturnValue(ctx);

    const strokes: Stroke[] = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
    ];
    const currentStroke: Stroke = [];

    redrawCanvas(canvas, strokes, currentStroke);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.strokeStyle).toBe("#000");
    expect(ctx.lineWidth).toBe(2);
  });

  it("should draw current stroke if it has more than 1 point", () => {
    const canvas = {
      width: 800,
      height: 600,
      getContext: vi.fn(),
    } as unknown as HTMLCanvasElement;
    const ctx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      strokeStyle: "",
      lineWidth: 0,
      lineCap: "",
      lineJoin: "",
    } as unknown as CanvasRenderingContext2D;
    vi.mocked(canvas.getContext).mockReturnValue(ctx);

    const strokes: Stroke[] = [];
    const currentStroke: Stroke = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];

    redrawCanvas(canvas, strokes, currentStroke);

    expect(ctx.beginPath).toHaveBeenCalled();
  });

  it("should handle null context gracefully", () => {
    const canvas = {
      width: 800,
      height: 600,
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement;

    const strokes: Stroke[] = [];
    const currentStroke: Stroke = [];

    expect(() => redrawCanvas(canvas, strokes, currentStroke)).not.toThrow();
  });
});

describe("getCanvasPoint", () => {
  it("should calculate correct point for mouse event", () => {
    const canvas = {
      getBoundingClientRect: vi.fn(() => ({
        left: 100,
        top: 50,
        width: 400,
        height: 300,
      })),
      width: 800,
      height: 600,
    } as unknown as HTMLCanvasElement;

    const mouseEvent = {
      clientX: 200,
      clientY: 150,
    } as React.MouseEvent<HTMLCanvasElement>;

    const result = getCanvasPoint(mouseEvent, canvas);

    expect(result.x).toBe(200);
    expect(result.y).toBe(200);
  });

  it("should calculate correct point for touch event", () => {
    const canvas = {
      getBoundingClientRect: vi.fn(() => ({
        left: 100,
        top: 50,
        width: 400,
        height: 300,
      })),
      width: 800,
      height: 600,
    } as unknown as HTMLCanvasElement;

    const touchEvent = {
      touches: [{ clientX: 200, clientY: 150 }],
    } as unknown as React.TouchEvent<HTMLCanvasElement>;

    const result = getCanvasPoint(touchEvent, canvas);

    expect(result.x).toBe(200);
    expect(result.y).toBe(200);
  });

  it("should apply scaling when canvas size differs from display size", () => {
    const canvas = {
      getBoundingClientRect: vi.fn(() => ({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
      })),
      width: 800,
      height: 600,
    } as unknown as HTMLCanvasElement;

    const mouseEvent = {
      clientX: 400,
      clientY: 300,
    } as React.MouseEvent<HTMLCanvasElement>;

    const result = getCanvasPoint(mouseEvent, canvas);

    expect(result.x).toBe(800);
    expect(result.y).toBe(600);
  });
});

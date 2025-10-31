import pako from "pako";
import type { Point, Stroke } from "./types";

function deltaEncode(stroke: Point[]): number[] {
  if (stroke.length === 0) return [];

  const result: number[] = [];
  result.push(Math.round(stroke[0].x), Math.round(stroke[0].y));

  for (let i = 1; i < stroke.length; i++) {
    const dx = Math.round(stroke[i].x) - Math.round(stroke[i - 1].x);
    const dy = Math.round(stroke[i].y) - Math.round(stroke[i - 1].y);
    result.push(dx, dy);
  }

  return result;
}

function deltaDecode(deltas: number[]): Point[] {
  if (deltas.length === 0) return [];

  const result: Point[] = [];
  let x = deltas[0];
  let y = deltas[1];
  result.push({ x, y });

  for (let i = 2; i < deltas.length; i += 2) {
    x += deltas[i];
    y += deltas[i + 1];
    result.push({ x, y });
  }

  return result;
}

export function encodeStrokes(strokesData: Stroke[]): string {
  const simplified = strokesData.map((stroke) => {
    const sampled = [];
    for (let i = 0; i < stroke.length; i += 3) {
      sampled.push(stroke[i]);
    }
    if (stroke.length > 0 && (stroke.length - 1) % 3 !== 0) {
      sampled.push(stroke[stroke.length - 1]);
    }
    return sampled;
  });

  const deltaEncoded = simplified.map(deltaEncode);
  const json = JSON.stringify(deltaEncoded);
  const compressed = pako.deflate(json);
  const base64 = btoa(String.fromCharCode(...compressed))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return base64;
}

export function decodeStrokes(encoded: string): Stroke[] {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;

    const compressed = Uint8Array.from(atob(paddedBase64), (c) =>
      c.charCodeAt(0),
    );
    const json = pako.inflate(compressed, { to: "string" });
    const deltaEncoded = JSON.parse(json);

    return deltaEncoded.map((deltas: number[]) => deltaDecode(deltas));
  } catch {
    try {
      const decoded = JSON.parse(atob(encoded));
      return decoded.map((stroke: number[][]) =>
        stroke.map(([x, y]: number[]) => ({ x, y })),
      );
    } catch {
      return [];
    }
  }
}

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
): void {
  if (stroke.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(stroke[0].x, stroke[0].y);
  for (let i = 1; i < stroke.length; i++) {
    ctx.lineTo(stroke[i].x, stroke[i].y);
  }
  ctx.stroke();
}

export function redrawCanvas(
  canvas: HTMLCanvasElement,
  strokes: Stroke[],
  currentStroke: Stroke,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const stroke of strokes) {
    drawStroke(ctx, stroke);
  }

  if (currentStroke.length > 1) {
    drawStroke(ctx, currentStroke);
  }
}

export function getCanvasPoint(
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
): Point {
  const rect = canvas.getBoundingClientRect();
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

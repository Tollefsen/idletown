import type { Point, Stroke } from "./types";

export function encodeStrokes(strokesData: Stroke[]): string {
  const simplified = strokesData.map((stroke) => {
    const sampled = [];
    for (let i = 0; i < stroke.length; i += 3) {
      sampled.push([Math.round(stroke[i].x), Math.round(stroke[i].y)]);
    }
    if (stroke.length > 0 && (stroke.length - 1) % 3 !== 0) {
      const last = stroke[stroke.length - 1];
      sampled.push([Math.round(last.x), Math.round(last.y)]);
    }
    return sampled;
  });
  return btoa(JSON.stringify(simplified));
}

export function decodeStrokes(encoded: string): Stroke[] {
  try {
    const decoded = JSON.parse(atob(encoded));
    return decoded.map((stroke: number[][]) =>
      stroke.map(([x, y]: number[]) => ({ x, y })),
    );
  } catch {
    return [];
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

import { useEffect, useRef, useState } from "react";
import type { Stroke } from "./types";
import { getCanvasPoint, redrawCanvas } from "./utils";

type SketchCanvasProps = {
  strokes: Stroke[];
  currentStroke: Stroke;
  onStrokeComplete: (stroke: Stroke) => void;
  onStrokeUpdate: (stroke: Stroke) => void;
};

export function SketchCanvas({
  strokes,
  currentStroke,
  onStrokeComplete,
  onStrokeUpdate,
}: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    redrawCanvas(canvas, strokes, currentStroke);
  }, [strokes, currentStroke]);

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const point = getCanvasPoint(e, canvas);
    onStrokeUpdate([point]);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(e, canvas);
    onStrokeUpdate([...currentStroke, point]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      onStrokeComplete(currentStroke);
    }
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={700}
      className="border-2 border-gray-300 rounded cursor-crosshair touch-none w-full h-auto"
      style={{ aspectRatio: "6/7" }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
}

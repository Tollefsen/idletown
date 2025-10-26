"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type Stroke = Point[];

export default function Sketchbook() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke>([]);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const searchParams = useSearchParams();

  const encodeStrokes = (strokesData: Stroke[]): string => {
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
  };

  const decodeStrokes = useCallback((encoded: string): Stroke[] => {
    try {
      const decoded = JSON.parse(atob(encoded));
      return decoded.map((stroke: number[][]) =>
        stroke.map(([x, y]: number[]) => ({ x, y })),
      );
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      const loadedStrokes = decodeStrokes(data);
      setStrokes(loadedStrokes);
    }
  }, [searchParams, decodeStrokes]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of strokes) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }

    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }
  }, [strokes, currentStroke]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasPoint = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setCurrentStroke([point]);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getCanvasPoint(e);
    setCurrentStroke((prev) => [...prev, point]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke([]);
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setShowQR(false);
  };

  const handleShare = async () => {
    const encoded = encodeStrokes(strokes);
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(qrDataUrl);
      setShowQR(true);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-8">
      <Link
        href="/"
        className="absolute top-4 left-4 text-sm text-gray-700 hover:underline"
      >
        ← Back to Idle Town
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-4">Sketchbook</h1>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border-2 border-gray-300 rounded cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={strokes.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Share
          </button>
        </div>
      </div>

      {showQR && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowQR(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowQR(false);
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Scan to View Drawing
            </h2>
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              width={300}
              height={300}
              unoptimized
            />
            <button
              type="button"
              onClick={() => setShowQR(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

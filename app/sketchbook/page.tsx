"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { Suspense, useEffect, useState } from "react";
import { QRModal } from "./QRModal";
import { SketchCanvas } from "./SketchCanvas";
import type { Stroke } from "./types";
import { decodeStrokes, encodeStrokes } from "./utils";

function SketchbookContent() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke>([]);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      const loadedStrokes = decodeStrokes(data);
      setStrokes(loadedStrokes);
    }
  }, [searchParams]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes((prev) => [...prev, stroke]);
    setCurrentStroke([]);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setShowQR(false);
    setError(null);
  };

  const handleShare = async () => {
    const encoded = encodeStrokes(strokes);
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;

    const QR_CAPACITY = 3391;
    if (url.length > QR_CAPACITY) {
      setError(
        `Drawing is too detailed (${url.length} chars, max ${QR_CAPACITY}). Try a simpler drawing.`,
      );
      return;
    }

    setError(null);
    setShareUrl(url);
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(qrDataUrl);
      setShowQR(true);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
      setError("Failed to generate QR code. Drawing may be too detailed.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4 sm:p-8">
      <Link
        href="/"
        className="absolute top-4 left-4 text-sm text-gray-700 hover:underline"
      >
        ← Back to Idle Town
      </Link>

      <div className="flex flex-col items-center justify-center flex-1 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 mt-12 sm:mt-0">
          Sketchbook
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 w-full sm:max-w-lg">
          <SketchCanvas
            strokes={strokes}
            currentStroke={currentStroke}
            onStrokeComplete={handleStrokeComplete}
            onStrokeUpdate={setCurrentStroke}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={clearCanvas}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={strokes.length === 0}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {showQR && (
        <QRModal
          qrCodeUrl={qrCodeUrl}
          shareUrl={shareUrl}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}

export default function Sketchbook() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <SketchbookContent />
    </Suspense>
  );
}

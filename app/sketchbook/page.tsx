"use client";

import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { Suspense, useEffect, useState } from "react";
import { BackLink } from "../components/BackLink";
import { Button } from "../components/Button";
import { LIMITS, MESSAGES } from "../config/constants";
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

    if (url.length > LIMITS.qrCapacity) {
      setError(
        MESSAGES.errors.drawingTooDetailed(url.length, LIMITS.qrCapacity),
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
      setError(MESSAGES.errors.qrGenerationFailed);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4 sm:p-8">
      <BackLink />

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
            <Button variant="danger" onClick={clearCanvas} className="flex-1">
              Clear
            </Button>
            <Button
              variant="primary"
              onClick={handleShare}
              disabled={strokes.length === 0}
              className="flex-1"
            >
              Share
            </Button>
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

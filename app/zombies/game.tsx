"use client";

import kaplay from "kaplay";
import { useEffect, useRef } from "react";
import { setupGame } from "./gameSrc/main";

export function ZombiesGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || initialized.current) return;

    initialized.current = true;

    const k = kaplay({
      canvas: canvasRef.current,
      debug: true,
      global: false,
    });

    setupGame(k);
  }, []);

  return <canvas ref={canvasRef} />;
}

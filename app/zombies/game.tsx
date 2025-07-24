'use client';

import kaplay from "kaplay";
import { useEffect } from "react";
import { setupGame } from "./gameSrc/main";

export function ZombiesGame() {
  useEffect(() => {
    initGame();
  }, []);
  return (
      <canvas id="game" />
  );
}

function initGame() {
  const k = kaplay({
    canvas: document.getElementById("game") as HTMLCanvasElement,
    debug: true,
    global: false,
  });

  setupGame(k);

};


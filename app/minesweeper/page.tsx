"use client";

import { useCallback, useEffect } from "react";
import { BackLink, Button } from "@/app/components";
import { ControlsHelp } from "./components/ControlsHelp";
import { GameHud } from "./components/GameHud";
import { Minefield } from "./components/Minefield";
import { TouchControls } from "./components/TouchControls";
import { useMinesweeper } from "./hooks/useMinesweeper";
import type { Difficulty, Direction } from "./lib/types";
import { DIFFICULTIES } from "./lib/types";

const DIFFICULTY_LIST = Object.values(DIFFICULTIES);

export default function MinesweeperPage() {
  const { state, move, flag, restart } = useMinesweeper(DIFFICULTIES.beginner);
  const gameOver = state.status === "won" || state.status === "lost";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const directionMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        W: "up",
        s: "down",
        S: "down",
        a: "left",
        A: "left",
        d: "right",
        D: "right",
      };

      const direction = directionMap[e.key];
      if (direction) {
        e.preventDefault();
        move(direction);
        return;
      }

      if (e.key === " " || e.key === "f" || e.key === "F") {
        e.preventDefault();
        flag();
        return;
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        restart();
      }
    },
    [move, flag, restart],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDifficultySelect = (difficulty: Difficulty) => {
    restart(difficulty);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-stone-100 dark:bg-stone-900 p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <BackLink href="/" className="mb-4" />

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-stone-800 dark:text-stone-200">
          Minefield
        </h1>
        <p className="text-center text-stone-500 dark:text-stone-400 text-sm mb-4">
          Navigate the field. Reveal every safe tile to win.
        </p>

        <div className="flex justify-center gap-2 mb-4">
          {DIFFICULTY_LIST.map((d) => (
            <Button
              key={d.name}
              variant={
                state.difficulty.name === d.name ? "primary" : "secondary"
              }
              size="sm"
              onClick={() => handleDifficultySelect(d)}
            >
              {d.name}
            </Button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <GameHud
            mines={state.difficulty.mines}
            flagsPlaced={state.flagsPlaced}
            elapsedTime={state.elapsedTime}
            status={state.status}
            revealedCount={state.revealedCount}
            totalSafeCells={state.totalSafeCells}
          />

          <div className="relative">
            <Minefield
              grid={state.grid}
              player={state.player}
              facing={state.facing}
              gameOver={gameOver}
            />

            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded">
                <div className="bg-white dark:bg-stone-800 rounded-xl p-6 text-center shadow-2xl">
                  <p className="text-3xl mb-2">
                    {state.status === "won" ? "\uD83C\uDF89" : "\uD83D\uDCA3"}
                  </p>
                  <p className="text-xl font-bold mb-1 text-stone-800 dark:text-stone-200">
                    {state.status === "won"
                      ? "Field Cleared!"
                      : "You hit a mine!"}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                    Time: {Math.floor(state.elapsedTime / 60)}:
                    {(state.elapsedTime % 60).toString().padStart(2, "0")}
                  </p>
                  <Button variant="primary" onClick={() => restart()}>
                    Play Again
                  </Button>
                </div>
              </div>
            )}
          </div>

          <TouchControls onMove={move} onFlag={flag} disabled={gameOver} />

          <div className="hidden sm:block">
            <ControlsHelp />
          </div>
        </div>
      </div>
    </div>
  );
}

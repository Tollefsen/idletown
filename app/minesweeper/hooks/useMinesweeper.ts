"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  countFlags,
  countRevealed,
  createEmptyGrid,
  getAdjacentPosition,
  isInBounds,
  placeMines,
  revealAllMines,
  revealCell,
} from "../lib/grid";
import type { Cell, Difficulty, Direction, GameState } from "../lib/types";
import { DIFFICULTIES } from "../lib/types";

function createInitialState(difficulty: Difficulty): GameState {
  return {
    grid: createEmptyGrid(difficulty.rows, difficulty.cols),
    player: {
      row: Math.floor(difficulty.rows / 2),
      col: Math.floor(difficulty.cols / 2),
    },
    facing: "up",
    status: "idle",
    flagsPlaced: 0,
    revealedCount: 0,
    totalSafeCells: difficulty.rows * difficulty.cols - difficulty.mines,
    difficulty,
    minesPlaced: false,
    startTime: null,
    elapsedTime: 0,
  };
}

export interface UseMinesweeperReturn {
  state: GameState;
  move: (direction: Direction) => void;
  flag: () => void;
  restart: (difficulty?: Difficulty) => void;
}

export function useMinesweeper(
  initialDifficulty: Difficulty = DIFFICULTIES.beginner,
): UseMinesweeperReturn {
  const [state, setState] = useState<GameState>(() =>
    createInitialState(initialDifficulty),
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.status === "playing" && state.startTime !== null) {
      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          elapsedTime: Math.floor((Date.now() - (prev.startTime ?? 0)) / 1000),
        }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, state.startTime]);

  const move = useCallback((direction: Direction) => {
    setState((prev) => {
      if (prev.status === "won" || prev.status === "lost") return prev;

      const newPos = getAdjacentPosition(prev.player, direction);

      if (!isInBounds(newPos, prev.difficulty.rows, prev.difficulty.cols)) {
        return { ...prev, facing: direction };
      }

      let grid = prev.grid;
      let minesPlaced = prev.minesPlaced;
      let status = prev.status;
      let startTime = prev.startTime;

      if (!minesPlaced) {
        grid = placeMines(grid, prev.difficulty.mines, newPos);
        minesPlaced = true;
        status = "playing";
        startTime = Date.now();
      }

      if (grid[newPos.row][newPos.col].hasMine) {
        grid = revealAllMines(grid);
        if (timerRef.current) clearInterval(timerRef.current);
        return {
          ...prev,
          grid,
          player: newPos,
          facing: direction,
          status: "lost" as const,
          minesPlaced,
          startTime,
          elapsedTime: startTime
            ? Math.floor((Date.now() - startTime) / 1000)
            : 0,
        };
      }

      grid = revealCell(grid, newPos.row, newPos.col);
      const revealedCount = countRevealed(grid);
      const totalSafe =
        prev.difficulty.rows * prev.difficulty.cols - prev.difficulty.mines;

      if (revealedCount >= totalSafe) {
        if (timerRef.current) clearInterval(timerRef.current);
        return {
          ...prev,
          grid,
          player: newPos,
          facing: direction,
          status: "won" as const,
          revealedCount,
          minesPlaced,
          startTime,
          elapsedTime: startTime
            ? Math.floor((Date.now() - startTime) / 1000)
            : 0,
        };
      }

      return {
        ...prev,
        grid,
        player: newPos,
        facing: direction,
        status,
        revealedCount,
        minesPlaced,
        startTime,
      };
    });
  }, []);

  const flag = useCallback(() => {
    setState((prev) => {
      if (prev.status !== "playing") return prev;

      const target = getAdjacentPosition(prev.player, prev.facing);
      if (!isInBounds(target, prev.difficulty.rows, prev.difficulty.cols)) {
        return prev;
      }

      const cell = prev.grid[target.row][target.col];
      if (cell.state === "revealed") return prev;

      const newGrid = prev.grid.map((row) => row.map((c) => ({ ...c })));
      const newState: Cell["state"] =
        cell.state === "flagged" ? "hidden" : "flagged";
      newGrid[target.row][target.col] = { ...cell, state: newState };

      return {
        ...prev,
        grid: newGrid,
        flagsPlaced: countFlags(newGrid),
      };
    });
  }, []);

  const restart = useCallback(
    (difficulty: Difficulty = state.difficulty) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setState(createInitialState(difficulty));
    },
    [state.difficulty],
  );

  return { state, move, flag, restart };
}

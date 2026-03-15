export type Direction = "up" | "down" | "left" | "right";

export type CellState = "hidden" | "revealed" | "flagged";

export type GameStatus = "idle" | "playing" | "won" | "lost";

export interface Cell {
  hasMine: boolean;
  adjacentMines: number;
  state: CellState;
}

export interface Position {
  row: number;
  col: number;
}

export interface Difficulty {
  name: string;
  rows: number;
  cols: number;
  mines: number;
}

export interface GameState {
  grid: Cell[][];
  player: Position;
  facing: Direction;
  status: GameStatus;
  flagsPlaced: number;
  revealedCount: number;
  totalSafeCells: number;
  difficulty: Difficulty;
  /** Mines placed after first move to guarantee safe start */
  minesPlaced: boolean;
  startTime: number | null;
  elapsedTime: number;
}

export const DIFFICULTIES: Record<string, Difficulty> = {
  beginner: { name: "Beginner", rows: 9, cols: 9, mines: 10 },
  intermediate: { name: "Intermediate", rows: 13, cols: 13, mines: 30 },
  expert: { name: "Expert", rows: 16, cols: 16, mines: 50 },
};

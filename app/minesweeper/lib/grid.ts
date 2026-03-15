import type { Cell, Direction, Position } from "./types";

export function createEmptyGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      hasMine: false,
      adjacentMines: 0,
      state: "hidden" as const,
    })),
  );
}

function getNeighbors(
  row: number,
  col: number,
  rows: number,
  cols: number,
): Position[] {
  const neighbors: Position[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push({ row: nr, col: nc });
      }
    }
  }
  return neighbors;
}

export function placeMines(
  grid: Cell[][],
  mineCount: number,
  safeZone: Position,
): Cell[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

  const safePositions = new Set<string>();
  safePositions.add(`${safeZone.row},${safeZone.col}`);
  for (const n of getNeighbors(safeZone.row, safeZone.col, rows, cols)) {
    safePositions.add(`${n.row},${n.col}`);
  }

  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (safePositions.has(`${r},${c}`) || newGrid[r][c].hasMine) continue;
    newGrid[r][c].hasMine = true;
    placed++;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newGrid[r][c].hasMine) continue;
      newGrid[r][c].adjacentMines = getNeighbors(r, c, rows, cols).filter(
        (n) => newGrid[n.row][n.col].hasMine,
      ).length;
    }
  }

  return newGrid;
}

export function revealCell(grid: Cell[][], row: number, col: number): Cell[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = grid.map((r) => r.map((cell) => ({ ...cell })));

  const stack: Position[] = [{ row, col }];

  while (stack.length > 0) {
    const pos = stack.pop();
    if (!pos) continue;
    const cell = newGrid[pos.row][pos.col];

    if (cell.state === "revealed" || cell.state === "flagged") continue;

    cell.state = "revealed";

    if (cell.adjacentMines === 0 && !cell.hasMine) {
      for (const n of getNeighbors(pos.row, pos.col, rows, cols)) {
        if (newGrid[n.row][n.col].state === "hidden") {
          stack.push(n);
        }
      }
    }
  }

  return newGrid;
}

export function revealAllMines(grid: Cell[][]): Cell[][] {
  return grid.map((row) =>
    row.map((cell) =>
      cell.hasMine ? { ...cell, state: "revealed" as const } : { ...cell },
    ),
  );
}

export function getAdjacentPosition(
  pos: Position,
  facing: Direction,
): Position {
  switch (facing) {
    case "up":
      return { row: pos.row - 1, col: pos.col };
    case "down":
      return { row: pos.row + 1, col: pos.col };
    case "left":
      return { row: pos.row, col: pos.col - 1 };
    case "right":
      return { row: pos.row, col: pos.col + 1 };
  }
}

export function isInBounds(pos: Position, rows: number, cols: number): boolean {
  return pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols;
}

export function countRevealed(grid: Cell[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.state === "revealed" && !cell.hasMine) count++;
    }
  }
  return count;
}

export function countFlags(grid: Cell[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.state === "flagged") count++;
    }
  }
  return count;
}

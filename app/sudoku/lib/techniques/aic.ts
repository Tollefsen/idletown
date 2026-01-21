// Alternating Inference Chains (AIC) - IMPLEMENTED
// A chain of logical links between candidates:
// - Strong link: If A is false, B must be true (only 2 candidates in a unit for a digit, or bivalue cell)
// - Weak link: If A is true, B must be false (A and B are peers for the same digit)
//
// The chain alternates: strong-weak-strong-weak...
// If a chain starts and ends with strong links on the same digit:
// - Any cell that sees BOTH endpoints can have that digit eliminated
// If both endpoints are the same cell with different digits:
// - All other candidates in that cell can be eliminated

import { getAllUnits, getPeerIndices, toIndex } from "../candidates";
import type { Digit, SudokuGrid, Technique, TechniqueResult } from "../types";

interface ChainNode {
  cellIndex: number;
  row: number;
  col: number;
  digit: Digit;
}

interface ChainLink {
  from: ChainNode;
  to: ChainNode;
  type: "strong" | "weak";
}

/**
 * Find all strong links for a digit in the grid
 * Strong link: exactly 2 cells in a unit have this candidate
 */
function findStrongLinks(grid: SudokuGrid, digit: Digit): ChainLink[] {
  const links: ChainLink[] = [];
  const units = getAllUnits();

  for (const unit of units) {
    const cellsWithDigit = unit.cells.filter((idx) => {
      const cell = grid[idx];
      return cell.value === null && cell.candidates.has(digit);
    });

    if (cellsWithDigit.length === 2) {
      const [idx1, idx2] = cellsWithDigit;
      const cell1 = grid[idx1];
      const cell2 = grid[idx2];

      links.push({
        from: { cellIndex: idx1, row: cell1.row, col: cell1.col, digit },
        to: { cellIndex: idx2, row: cell2.row, col: cell2.col, digit },
        type: "strong",
      });
    }
  }

  return links;
}

/**
 * Find strong links within a bivalue cell (between its two candidates)
 */
function findBivalueCellLinks(grid: SudokuGrid): ChainLink[] {
  const links: ChainLink[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const idx = toIndex(row, col);
      const cell = grid[idx];

      if (cell.value === null && cell.candidates.size === 2) {
        const [d1, d2] = Array.from(cell.candidates) as [Digit, Digit];

        // Strong link between the two candidates in this cell
        links.push({
          from: { cellIndex: idx, row, col, digit: d1 },
          to: { cellIndex: idx, row, col, digit: d2 },
          type: "strong",
        });
      }
    }
  }

  return links;
}

/**
 * Check if two cells see each other
 */
function cellsSeeEachOther(idx1: number, idx2: number): boolean {
  if (idx1 === idx2) return false;
  const row1 = Math.floor(idx1 / 9);
  const col1 = idx1 % 9;
  const row2 = Math.floor(idx2 / 9);
  const col2 = idx2 % 9;

  if (row1 === row2) return true;
  if (col1 === col2) return true;

  const box1 = Math.floor(row1 / 3) * 3 + Math.floor(col1 / 3);
  const box2 = Math.floor(row2 / 3) * 3 + Math.floor(col2 / 3);
  return box1 === box2;
}

/**
 * Build an adjacency map of all strong links
 */
function buildStrongLinkMap(
  grid: SudokuGrid,
): Map<
  string,
  Array<{ cellIndex: number; row: number; col: number; digit: Digit }>
> {
  const map = new Map<
    string,
    Array<{ cellIndex: number; row: number; col: number; digit: Digit }>
  >();

  // Add digit-based strong links
  for (let d = 1; d <= 9; d++) {
    const digit = d as Digit;
    const links = findStrongLinks(grid, digit);

    for (const link of links) {
      const key1 = `${link.from.cellIndex}-${link.from.digit}`;
      const key2 = `${link.to.cellIndex}-${link.to.digit}`;

      if (!map.has(key1)) map.set(key1, []);
      if (!map.has(key2)) map.set(key2, []);

      map.get(key1)?.push(link.to);
      map.get(key2)?.push(link.from);
    }
  }

  // Add bivalue cell links
  const bivalueLinks = findBivalueCellLinks(grid);
  for (const link of bivalueLinks) {
    const key1 = `${link.from.cellIndex}-${link.from.digit}`;
    const key2 = `${link.to.cellIndex}-${link.to.digit}`;

    if (!map.has(key1)) map.set(key1, []);
    if (!map.has(key2)) map.set(key2, []);

    map.get(key1)?.push(link.to);
    map.get(key2)?.push(link.from);
  }

  return map;
}

/**
 * Find weak link targets from a node (same digit, different cell that sees this one)
 */
function findWeakLinkTargets(grid: SudokuGrid, node: ChainNode): ChainNode[] {
  const targets: ChainNode[] = [];
  const peers = getPeerIndices(node.row, node.col);

  for (const peerIdx of peers) {
    const cell = grid[peerIdx];
    if (cell.value === null && cell.candidates.has(node.digit)) {
      targets.push({
        cellIndex: peerIdx,
        row: cell.row,
        col: cell.col,
        digit: node.digit,
      });
    }
  }

  return targets;
}

export const aic: Technique = {
  id: "aic",
  name: "Alternating Inference Chains",
  difficulty: "master",
  implemented: true,
  description:
    "Chains of strong and weak links between candidates that lead to eliminations through logical inference.",

  apply(grid: SudokuGrid): TechniqueResult | null {
    const strongLinkMap = buildStrongLinkMap(grid);

    // Try to find short AICs (length 3-5) that produce eliminations
    // Start from each strong link endpoint and try to build alternating chains

    for (const [startKey, strongTargets] of strongLinkMap) {
      const [cellIdxStr, digitStr] = startKey.split("-");
      const startCellIdx = Number.parseInt(cellIdxStr, 10);
      const startDigit = Number.parseInt(digitStr, 10) as Digit;
      const startCell = grid[startCellIdx];

      if (startCell.value !== null) continue;

      const startNode: ChainNode = {
        cellIndex: startCellIdx,
        row: startCell.row,
        col: startCell.col,
        digit: startDigit,
      };

      // BFS to find chains: alternate strong -> weak -> strong -> weak -> strong
      // We want chains that start with strong and end with strong
      type ChainState = {
        node: ChainNode;
        lastLinkType: "strong" | "weak";
        path: ChainNode[];
      };

      const queue: ChainState[] = [];

      // Start by following strong links from the start node
      for (const target of strongTargets) {
        queue.push({
          node: target,
          lastLinkType: "strong",
          path: [startNode, target],
        });
      }

      const visited = new Set<string>();
      visited.add(startKey);

      while (queue.length > 0) {
        const state = queue.shift();
        if (!state) continue;

        const { node, lastLinkType, path } = state;
        const nodeKey = `${node.cellIndex}-${node.digit}`;

        // Limit chain length to avoid infinite loops
        if (path.length > 7) continue;

        // Check for AIC elimination opportunities
        // If we ended on a strong link and the digit matches the start digit,
        // any cell that sees both endpoints can have that digit eliminated
        if (lastLinkType === "strong" && path.length >= 3) {
          const endNode = node;

          if (
            endNode.digit === startDigit &&
            endNode.cellIndex !== startCellIdx
          ) {
            // Find cells that see both start and end
            const eliminations: Array<{
              row: number;
              col: number;
              candidates: number[];
            }> = [];

            for (let row = 0; row < 9; row++) {
              for (let col = 0; col < 9; col++) {
                const idx = toIndex(row, col);
                const cell = grid[idx];

                if (idx === startCellIdx || idx === endNode.cellIndex) continue;
                if (cell.value !== null) continue;
                if (!cell.candidates.has(startDigit)) continue;

                const seesStart = cellsSeeEachOther(idx, startCellIdx);
                const seesEnd = cellsSeeEachOther(idx, endNode.cellIndex);

                if (seesStart && seesEnd) {
                  eliminations.push({
                    row,
                    col,
                    candidates: [startDigit],
                  });
                }
              }
            }

            if (eliminations.length > 0) {
              return {
                techniqueId: "aic",
                placements: [],
                eliminations,
                description: `AIC: Chain of ${path.length} nodes for digit ${startDigit} - eliminate ${startDigit} from cells seeing both endpoints`,
              };
            }
          }
        }

        // Continue building the chain
        if (lastLinkType === "strong") {
          // Next link should be weak (same digit, different cell)
          const weakTargets = findWeakLinkTargets(grid, node);
          for (const target of weakTargets) {
            const targetKey = `${target.cellIndex}-${target.digit}`;
            if (
              !visited.has(targetKey) &&
              !path.some(
                (n) =>
                  n.cellIndex === target.cellIndex && n.digit === target.digit,
              )
            ) {
              queue.push({
                node: target,
                lastLinkType: "weak",
                path: [...path, target],
              });
            }
          }
        } else {
          // Next link should be strong
          const strongTargetsFromHere = strongLinkMap.get(nodeKey) || [];
          for (const target of strongTargetsFromHere) {
            const targetKey = `${target.cellIndex}-${target.digit}`;
            if (
              !visited.has(targetKey) &&
              !path.some(
                (n) =>
                  n.cellIndex === target.cellIndex && n.digit === target.digit,
              )
            ) {
              queue.push({
                node: target,
                lastLinkType: "strong",
                path: [...path, target],
              });
            }
          }
        }
      }
    }

    return null;
  },
};

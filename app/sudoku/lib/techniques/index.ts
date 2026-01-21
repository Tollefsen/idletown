// Technique Registry - All techniques in order of difficulty

import type { Technique } from "../types";
import { aic } from "./aic";
import { boxLineReduction } from "./boxLineReduction";
import { forcingChains } from "./forcingChains";
import { hiddenPairs } from "./hiddenPairs";
import { hiddenQuads } from "./hiddenQuads";
import { hiddenSingle } from "./hiddenSingle";
import { hiddenTriples } from "./hiddenTriples";
// Placeholder techniques - Basic/Medium
import { nakedPairs } from "./nakedPairs";
import { nakedQuads } from "./nakedQuads";
// Implemented techniques
import { nakedSingle } from "./nakedSingle";
// Placeholder techniques - Hard
import { nakedTriples } from "./nakedTriples";
import { pointingPairs } from "./pointingPairs";
import { simpleColoring } from "./simpleColoring";
import { swordfish } from "./swordfish";
// Placeholder techniques - Master
import { uniqueRectangles } from "./uniqueRectangles";
// Placeholder techniques - Expert
import { xWing } from "./xWing";
import { xyWing } from "./xyWing";
import { xyzWing } from "./xyzWing";

/**
 * All techniques in order from easiest to hardest.
 * The solver will try techniques in this order.
 */
export const ALL_TECHNIQUES: Technique[] = [
  // Easy
  nakedSingle,
  hiddenSingle,

  // Medium
  nakedPairs,
  hiddenPairs,
  pointingPairs,
  boxLineReduction,

  // Hard
  nakedTriples,
  hiddenTriples,
  nakedQuads,
  hiddenQuads,

  // Expert
  xWing,
  swordfish,
  xyWing,
  xyzWing,
  simpleColoring,

  // Master
  uniqueRectangles,
  aic,
  forcingChains,
];

/** Get a technique by its ID */
export function getTechniqueById(id: string): Technique | undefined {
  return ALL_TECHNIQUES.find((t) => t.id === id);
}

/** Get all implemented techniques */
export function getImplementedTechniques(): Technique[] {
  return ALL_TECHNIQUES.filter((t) => t.implemented);
}

/** Get all placeholder techniques */
export function getPlaceholderTechniques(): Technique[] {
  return ALL_TECHNIQUES.filter((t) => !t.implemented);
}

// Re-export individual techniques for convenience
export {
  nakedSingle,
  hiddenSingle,
  nakedPairs,
  hiddenPairs,
  pointingPairs,
  boxLineReduction,
  nakedTriples,
  hiddenTriples,
  nakedQuads,
  hiddenQuads,
  xWing,
  swordfish,
  xyWing,
  xyzWing,
  simpleColoring,
  uniqueRectangles,
  aic,
  forcingChains,
};

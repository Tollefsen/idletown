// Difficulty rating utilities

import type { Difficulty } from "./types";

/** Get color for difficulty level */
export function getDifficultyColor(
  difficulty: Difficulty | "unsolvable",
): string {
  switch (difficulty) {
    case "easy":
      return "text-green-600 bg-green-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "hard":
      return "text-orange-600 bg-orange-100";
    case "expert":
      return "text-red-600 bg-red-100";
    case "master":
      return "text-purple-600 bg-purple-100";
    case "unsolvable":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

/** Get display label for difficulty */
export function getDifficultyLabel(
  difficulty: Difficulty | "unsolvable",
): string {
  switch (difficulty) {
    case "easy":
      return "Easy";
    case "medium":
      return "Medium";
    case "hard":
      return "Hard";
    case "expert":
      return "Expert";
    case "master":
      return "Master";
    case "unsolvable":
      return "Unsolvable";
    default:
      return "Unknown";
  }
}

/** Get description for difficulty */
export function getDifficultyDescription(
  difficulty: Difficulty | "unsolvable",
): string {
  switch (difficulty) {
    case "easy":
      return "Solvable using only basic single techniques";
    case "medium":
      return "Requires pairs and pointing techniques";
    case "hard":
      return "Requires triples and quads techniques";
    case "expert":
      return "Requires advanced pattern recognition";
    case "master":
      return "Requires chains and advanced logic";
    case "unsolvable":
      return "Cannot be solved with implemented techniques";
    default:
      return "";
  }
}

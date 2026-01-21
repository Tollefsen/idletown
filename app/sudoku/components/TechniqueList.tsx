"use client";

import { getDifficultyColor } from "../lib/difficulty";
import type { TechniqueUsage } from "../lib/types";

interface TechniqueListProps {
  techniqueUsage: TechniqueUsage[];
  showAll?: boolean;
}

export function TechniqueList({
  techniqueUsage,
  showAll = false,
}: TechniqueListProps) {
  // Filter to show only used techniques, or all if showAll is true
  const techniquesToShow = showAll
    ? techniqueUsage
    : techniqueUsage.filter((t) => t.count > 0 || !t.implemented);

  // Group by difficulty
  const grouped = techniquesToShow.reduce(
    (acc, technique) => {
      if (!acc[technique.difficulty]) {
        acc[technique.difficulty] = [];
      }
      acc[technique.difficulty].push(technique);
      return acc;
    },
    {} as Record<string, TechniqueUsage[]>,
  );

  const difficultyOrder = ["easy", "medium", "hard", "expert", "master"];

  return (
    <div className="space-y-4">
      {difficultyOrder.map((difficulty) => {
        const techniques = grouped[difficulty];
        if (!techniques || techniques.length === 0) return null;

        return (
          <div key={difficulty}>
            <h4 className="mb-2 text-sm font-semibold capitalize text-gray-500">
              {difficulty}
            </h4>
            <ul className="space-y-1">
              {techniques.map((technique) => (
                <li
                  key={technique.techniqueId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    {technique.implemented ? (
                      technique.count > 0 ? (
                        <span className="text-green-600">&#10003;</span>
                      ) : (
                        <span className="text-gray-400">&#9675;</span>
                      )
                    ) : (
                      <span className="text-yellow-500" title="Not implemented">
                        &#9888;
                      </span>
                    )}
                    <span
                      className={
                        technique.implemented
                          ? "text-gray-800"
                          : "text-gray-400"
                      }
                    >
                      {technique.techniqueName}
                    </span>
                  </span>
                  {technique.count > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${getDifficultyColor(technique.difficulty)}`}
                    >
                      {technique.count}x
                    </span>
                  )}
                  {!technique.implemented && (
                    <span className="text-xs text-gray-400">placeholder</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { Card } from "@/app/components";
import type { PaceStatus } from "../types";

interface PaceIndicatorProps {
  pace: PaceStatus;
}

export function PaceIndicator({ pace }: PaceIndicatorProps) {
  const getStatusColor = () => {
    switch (pace.status) {
      case "ahead":
        return "text-green-600 dark:text-green-400";
      case "behind":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const getStatusBg = () => {
    switch (pace.status) {
      case "ahead":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
      case "behind":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
      default:
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
    }
  };

  const getStatusMessage = () => {
    if (pace.status === "ahead") {
      return `${pace.difference} project${pace.difference !== 1 ? "s" : ""} ahead of schedule`;
    }
    if (pace.status === "behind") {
      return `${pace.difference} project${pace.difference !== 1 ? "s" : ""} behind schedule`;
    }
    return "Right on track!";
  };

  return (
    <Card padding="lg" className={`border ${getStatusBg()}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className={`text-2xl font-bold ${getStatusColor()}`}>
            {pace.status === "ahead" && "Ahead"}
            {pace.status === "behind" && "Behind"}
            {pace.status === "on-track" && "On Track"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {getStatusMessage()}
          </p>
        </div>

        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Expected</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {pace.expectedByNow}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Actual</p>
            <p className={`text-xl font-semibold ${getStatusColor()}`}>
              {pace.actual}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Remaining</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {pace.projectsRemaining}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Need/week</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {pace.requiredPace.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

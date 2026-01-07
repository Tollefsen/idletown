"use client";

import { Card } from "@/app/components";
import type { DashboardStats } from "../types";
import { GOAL_PROJECTS } from "../types";

interface StatsGridProps {
  stats: DashboardStats;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <Card padding="md">
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {sublabel}
          </p>
        )}
      </div>
    </Card>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  const completionPercentage = Math.round(
    (stats.totalProjects / GOAL_PROJECTS) * 100,
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Projects Completed"
        value={`${stats.totalProjects}/${GOAL_PROJECTS}`}
        sublabel={`${completionPercentage}% complete`}
      />
      <StatCard
        label="Current Week"
        value={stats.currentWeek}
        sublabel={`of 52 weeks`}
      />
      <StatCard
        label="This Month"
        value={stats.projectsThisMonth}
        sublabel="projects created"
      />
      <StatCard
        label="Avg Pace"
        value={stats.averagePace.toFixed(2)}
        sublabel="projects/week"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Badge, Card, Tabs } from "@/app/components";
import type { MonthlyData, TimelineProject } from "../types";
import { formatDate, getCategoryColor } from "../utils";

interface ProjectsTimelineProps {
  projects: TimelineProject[];
  monthlyData: MonthlyData[];
  currentWeek: number;
}

/**
 * GitHub-style calendar heatmap view
 */
function CalendarHeatmap({ projects }: { projects: TimelineProject[] }) {
  // Create a map of dayOfYear -> project count
  const projectsByDay = new Map<number, TimelineProject[]>();
  for (const p of projects) {
    const existing = projectsByDay.get(p.dayOfYear) ?? [];
    projectsByDay.set(p.dayOfYear, [...existing, p]);
  }

  // Generate all days of 2026 (365 days, not a leap year)
  const totalDays = 365;
  const weeks: number[][] = [];
  let currentWeekDays: number[] = [];

  // January 1, 2026 is a Thursday (day index 4, 0 = Sunday)
  // Add empty cells for days before Thursday
  for (let i = 0; i < 4; i++) {
    currentWeekDays.push(-1); // -1 = empty cell
  }

  for (let day = 1; day <= totalDays; day++) {
    currentWeekDays.push(day);
    if (currentWeekDays.length === 7) {
      weeks.push(currentWeekDays);
      currentWeekDays = [];
    }
  }
  // Push remaining days
  if (currentWeekDays.length > 0) {
    while (currentWeekDays.length < 7) {
      currentWeekDays.push(-1);
    }
    weeks.push(currentWeekDays);
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex mb-1 text-xs text-gray-500 dark:text-gray-400">
        {months.map((month, i) => (
          <span
            key={month}
            className="flex-shrink-0"
            style={{
              marginLeft: i === 0 ? "0" : "auto",
              width: `${(1 / 12) * 100}%`,
              minWidth: "40px",
            }}
          >
            {month}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex gap-0.5">
        {weeks.map((week) => {
          // Use first valid day in week as key
          const firstValidDay = week.find((d) => d !== -1);
          const weekKey = firstValidDay
            ? `week-${firstValidDay}`
            : `empty-week-${week.join("-")}`;
          return (
            <div key={weekKey} className="flex flex-col gap-0.5">
              {week.map((day) => {
                if (day === -1) {
                  return null; // Skip empty cells, we'll handle them differently
                }

                const dayProjects = projectsByDay.get(day) ?? [];
                const hasProject = dayProjects.length > 0;

                return (
                  <div
                    key={`day-${day}`}
                    className={`w-3 h-3 rounded-sm ${
                      hasProject
                        ? "bg-green-500 dark:bg-green-400"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                    title={
                      hasProject
                        ? dayProjects.map((p) => p.name).join(", ")
                        : `Day ${day}`
                    }
                  />
                );
              })}
              {/* Add empty cells for alignment */}
              {week
                .filter((d) => d === -1)
                .map((_, idx) => (
                  <div
                    key={`${weekKey}-pad-${idx.toString()}`}
                    className="w-3 h-3"
                    aria-hidden="true"
                  />
                ))}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
        <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800" />
        <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600" />
        <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-400" />
        <span>More</span>
      </div>
    </div>
  );
}

/**
 * Horizontal timeline view
 */
function HorizontalTimeline({
  projects,
  currentWeek,
}: {
  projects: TimelineProject[];
  currentWeek: number;
}) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Current day position (approximate)
  const currentDayOfYear = Math.min(currentWeek * 7, 365);
  const currentPosition = (currentDayOfYear / 365) * 100;

  return (
    <div className="relative">
      {/* Month markers */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        {months.map((month) => (
          <span key={month} className="w-8 text-center">
            {month}
          </span>
        ))}
      </div>

      {/* Timeline bar */}
      <div className="relative h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        {/* Current progress */}
        <div
          className="absolute top-0 left-0 h-full bg-blue-100 dark:bg-blue-900"
          style={{ width: `${currentPosition}%` }}
        />

        {/* Current week marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-red-500"
          style={{ left: `${currentPosition}%` }}
        />

        {/* Project markers */}
        {projects.map((project) => {
          const position = (project.dayOfYear / 365) * 100;
          const primaryCategory = project.category?.[0];
          const color = primaryCategory
            ? getCategoryColor(primaryCategory)
            : "#22c55e";

          return (
            <div
              key={project.route}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 cursor-pointer hover:scale-125 transition-transform"
              style={{
                left: `${position}%`,
                backgroundColor: color,
                marginLeft: "-8px",
              }}
              title={`${project.name} - ${formatDate(project.createdAt)}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-red-500" />
          <span>Current week</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Project</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Monthly list view
 */
function MonthlyListView({ monthlyData }: { monthlyData: MonthlyData[] }) {
  // Filter to only months with projects
  const monthsWithProjects = monthlyData.filter((m) => m.count > 0);

  if (monthsWithProjects.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No projects created yet in 2026.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {monthsWithProjects.map((month) => (
        <div key={month.month}>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {month.month}{" "}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({month.count} project{month.count !== 1 ? "s" : ""})
            </span>
          </h4>
          <div className="space-y-2">
            {month.projects.map((project) => (
              <div
                key={project.route}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {project.name}
                  </p>
                  {project.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {project.category?.map((cat) => (
                      <Badge
                        key={cat}
                        size="sm"
                        style={{
                          backgroundColor: getCategoryColor(cat),
                          color: "white",
                        }}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    {formatDate(project.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectsTimeline({
  projects,
  monthlyData,
  currentWeek,
}: ProjectsTimelineProps) {
  const [activeTab, setActiveTab] = useState("calendar");

  const tabs = [
    {
      id: "calendar",
      label: "Calendar Heatmap",
      content: <CalendarHeatmap projects={projects} />,
    },
    {
      id: "timeline",
      label: "Timeline",
      content: (
        <HorizontalTimeline projects={projects} currentWeek={currentWeek} />
      ),
    },
    {
      id: "list",
      label: "Monthly List",
      content: <MonthlyListView monthlyData={monthlyData} />,
    },
  ];

  return (
    <Card padding="lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Projects Timeline
      </h3>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </Card>
  );
}

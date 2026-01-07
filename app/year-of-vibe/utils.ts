import type { Project, ProjectCategory } from "@/app/config/constants";
import {
  type BurndownDataPoint,
  type CategoryData,
  type DashboardStats,
  GOAL_PROJECTS,
  type MonthlyData,
  type PaceStatus,
  type TimelineProject,
  TOTAL_WEEKS,
} from "./types";

const TARGET_YEAR = 2026;

/**
 * Filter projects to only those created in 2026
 */
export function get2026Projects(projects: Project[]): Project[] {
  return projects.filter((p) => p.createdAt.startsWith(`${TARGET_YEAR}-`));
}

/**
 * Get the ISO week number for a given date
 * ISO weeks start on Monday and week 1 is the week containing Jan 4
 */
export function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  // Set to nearest Thursday (current date + 4 - current day number, making Sunday = 7)
  const dayNum = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNum + 3);
  // January 4th is always in week 1
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNum = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNum + 3);
  // Calculate week number
  const weekNum = Math.round(
    (target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );
  return weekNum + 1;
}

/**
 * Get the current week of the year (1-52)
 */
export function getCurrentWeekOfYear(now: Date = new Date()): number {
  return getWeekNumber(now);
}

/**
 * Get the day of year (1-366)
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Calculate burndown chart data
 * Shows ideal pace vs actual progress over 52 weeks
 */
export function calculateBurndownData(
  projects: Project[],
  currentWeek: number,
): BurndownDataPoint[] {
  const projects2026 = get2026Projects(projects);
  const data: BurndownDataPoint[] = [];

  // Create a map of week -> cumulative projects
  const projectsByWeek = new Map<number, number>();
  let cumulative = 0;

  for (const project of projects2026) {
    const date = new Date(project.createdAt);
    const week = getWeekNumber(date);
    cumulative++;
    projectsByWeek.set(week, cumulative);
  }

  // Fill in cumulative values for all weeks
  let lastCumulative = 0;
  for (let week = 1; week <= Math.min(currentWeek, TOTAL_WEEKS); week++) {
    const weekProjects = projectsByWeek.get(week);
    if (weekProjects !== undefined) {
      lastCumulative = weekProjects;
    }
    data.push({
      week,
      ideal: GOAL_PROJECTS - (week * GOAL_PROJECTS) / TOTAL_WEEKS,
      actual: GOAL_PROJECTS - lastCumulative,
    });
  }

  // Add future weeks with only ideal line (for context)
  for (let week = currentWeek + 1; week <= TOTAL_WEEKS; week++) {
    data.push({
      week,
      ideal: GOAL_PROJECTS - (week * GOAL_PROJECTS) / TOTAL_WEEKS,
      actual: GOAL_PROJECTS - lastCumulative, // Stays flat for future
    });
  }

  return data;
}

/**
 * Calculate pace status (ahead, behind, or on-track)
 */
export function calculatePaceStatus(
  projects: Project[],
  now: Date = new Date(),
): PaceStatus {
  const projects2026 = get2026Projects(projects);
  const currentWeek = getCurrentWeekOfYear(now);
  const expectedByNow = Math.floor((currentWeek / TOTAL_WEEKS) * GOAL_PROJECTS);
  const actual = projects2026.length;
  const difference = actual - expectedByNow;
  const weeksRemaining = TOTAL_WEEKS - currentWeek;
  const projectsRemaining = GOAL_PROJECTS - actual;
  const requiredPace =
    weeksRemaining > 0 ? projectsRemaining / weeksRemaining : 0;

  let status: "ahead" | "behind" | "on-track";
  if (difference > 0) {
    status = "ahead";
  } else if (difference < 0) {
    status = "behind";
  } else {
    status = "on-track";
  }

  return {
    status,
    difference: Math.abs(difference),
    expectedByNow,
    actual,
    weeksRemaining,
    projectsRemaining,
    requiredPace,
  };
}

/**
 * Group projects by month
 */
export function groupProjectsByMonth(projects: Project[]): MonthlyData[] {
  const projects2026 = get2026Projects(projects);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthlyData: MonthlyData[] = months.map((month, index) => ({
    month,
    monthIndex: index,
    count: 0,
    projects: [],
  }));

  for (const project of projects2026) {
    const date = new Date(project.createdAt);
    const monthIndex = date.getMonth();
    monthlyData[monthIndex].count++;
    monthlyData[monthIndex].projects.push(project);
  }

  return monthlyData;
}

/**
 * Group projects by category
 */
export function groupProjectsByCategory(projects: Project[]): CategoryData[] {
  const projects2026 = get2026Projects(projects);
  const categoryMap = new Map<ProjectCategory, number>();

  for (const project of projects2026) {
    const categories = project.category ?? [];
    for (const cat of categories) {
      categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
    }
  }

  // Calculate total (note: can exceed project count due to multi-category)
  const totalCategoryOccurrences = Array.from(categoryMap.values()).reduce(
    (a, b) => a + b,
    0,
  );

  const result: CategoryData[] = [];
  for (const [category, count] of categoryMap) {
    result.push({
      category,
      count,
      percentage:
        totalCategoryOccurrences > 0
          ? (count / totalCategoryOccurrences) * 100
          : 0,
    });
  }

  // Sort by count descending
  result.sort((a, b) => b.count - a.count);
  return result;
}

/**
 * Calculate dashboard statistics
 */
export function calculateStats(
  projects: Project[],
  now: Date = new Date(),
): DashboardStats {
  const projects2026 = get2026Projects(projects);
  const currentWeek = getCurrentWeekOfYear(now);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Projects this month
  const projectsThisMonth = projects2026.filter((p) => {
    const date = new Date(p.createdAt);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  }).length;

  // Projects this week
  const projectsThisWeek = projects2026.filter((p) => {
    const date = new Date(p.createdAt);
    return getWeekNumber(date) === currentWeek;
  }).length;

  // Weeks elapsed (at least 1 if we're in 2026)
  const weeksElapsed =
    currentYear >= TARGET_YEAR ? Math.max(1, currentWeek) : 0;

  // Average pace
  const averagePace = weeksElapsed > 0 ? projects2026.length / weeksElapsed : 0;

  return {
    totalProjects: projects2026.length,
    projectsThisMonth,
    projectsThisWeek,
    currentWeek,
    averagePace,
    weeksElapsed,
  };
}

/**
 * Convert projects to timeline format with week and day info
 */
export function getTimelineProjects(projects: Project[]): TimelineProject[] {
  const projects2026 = get2026Projects(projects);

  return projects2026
    .map((p) => {
      const date = new Date(p.createdAt);
      return {
        ...p,
        weekNumber: getWeekNumber(date),
        dayOfYear: getDayOfYear(date),
      };
    })
    .sort((a, b) => a.dayOfYear - b.dayOfYear);
}

/**
 * Format a date as a readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get color for category
 */
export function getCategoryColor(category: ProjectCategory): string {
  const colors: Record<ProjectCategory, string> = {
    game: "#ef4444", // red
    tool: "#3b82f6", // blue
    utility: "#22c55e", // green
    creative: "#a855f7", // purple
    experiment: "#f97316", // orange
    dashboard: "#6366f1", // indigo
  };
  return colors[category] ?? "#6b7280";
}

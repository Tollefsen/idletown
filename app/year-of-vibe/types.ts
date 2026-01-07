import type { Project, ProjectCategory } from "@/app/config/constants";

export interface BurndownDataPoint {
  week: number;
  ideal: number;
  actual: number;
}

export interface PaceStatus {
  status: "ahead" | "behind" | "on-track";
  difference: number;
  expectedByNow: number;
  actual: number;
  weeksRemaining: number;
  projectsRemaining: number;
  requiredPace: number; // projects per week needed to finish on time
}

export interface MonthlyData {
  month: string;
  monthIndex: number;
  count: number;
  projects: Project[];
}

export interface CategoryData {
  category: ProjectCategory;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  totalProjects: number;
  projectsThisMonth: number;
  projectsThisWeek: number;
  currentWeek: number;
  averagePace: number; // projects per week so far
  weeksElapsed: number;
}

export interface TimelineProject extends Project {
  weekNumber: number;
  dayOfYear: number;
}

export const GOAL_PROJECTS = 52;
export const TOTAL_WEEKS = 52;

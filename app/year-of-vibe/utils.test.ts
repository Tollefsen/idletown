import { describe, expect, it } from "vitest";
import type { Project } from "@/app/config/constants";
import {
  calculateBurndownData,
  calculatePaceStatus,
  calculateStats,
  get2026Projects,
  getCategoryColor,
  getCurrentWeekOfYear,
  getDayOfYear,
  getTimelineProjects,
  getWeekNumber,
  groupProjectsByCategory,
  groupProjectsByMonth,
} from "./utils";

const mockProjects: Project[] = [
  {
    name: "Old Project",
    route: "/old",
    createdAt: "2025-06-15",
    hidden: false,
    external: false,
    category: ["tool"],
    status: "complete",
  },
  {
    name: "Project A",
    route: "/a",
    createdAt: "2026-01-07",
    hidden: false,
    external: false,
    category: ["tool", "utility"],
    status: "complete",
  },
  {
    name: "Project B",
    route: "/b",
    createdAt: "2026-01-14",
    hidden: false,
    external: false,
    category: ["game"],
    status: "complete",
  },
  {
    name: "Project C",
    route: "/c",
    createdAt: "2026-02-01",
    hidden: false,
    external: false,
    category: ["creative", "game"],
    status: "wip",
  },
];

describe("get2026Projects", () => {
  it("filters to only 2026 projects", () => {
    const result = get2026Projects(mockProjects);
    expect(result).toHaveLength(3);
    expect(result.every((p) => p.createdAt.startsWith("2026-"))).toBe(true);
  });

  it("returns empty array when no 2026 projects", () => {
    const oldProjects: Project[] = [
      {
        name: "Old",
        route: "/old",
        createdAt: "2025-01-01",
        hidden: false,
        external: false,
      },
    ];
    expect(get2026Projects(oldProjects)).toHaveLength(0);
  });
});

describe("getWeekNumber", () => {
  it("returns correct week for January 7, 2026", () => {
    // January 7, 2026 is a Wednesday in week 2
    const date = new Date(2026, 0, 7);
    expect(getWeekNumber(date)).toBe(2);
  });

  it("returns week 1 for January 1, 2026", () => {
    // January 1, 2026 is a Thursday - still week 1
    const date = new Date(2026, 0, 1);
    expect(getWeekNumber(date)).toBe(1);
  });

  it("returns correct week for mid-year", () => {
    // June 15, 2026 should be around week 25
    const date = new Date(2026, 5, 15);
    const week = getWeekNumber(date);
    expect(week).toBeGreaterThanOrEqual(24);
    expect(week).toBeLessThanOrEqual(26);
  });
});

describe("getCurrentWeekOfYear", () => {
  it("returns week number for provided date", () => {
    const date = new Date(2026, 0, 7);
    expect(getCurrentWeekOfYear(date)).toBe(2);
  });
});

describe("getDayOfYear", () => {
  it("returns 1 for January 1", () => {
    const date = new Date(2026, 0, 1);
    expect(getDayOfYear(date)).toBe(1);
  });

  it("returns 32 for February 1", () => {
    const date = new Date(2026, 1, 1);
    expect(getDayOfYear(date)).toBe(32);
  });
});

describe("calculateBurndownData", () => {
  it("returns data points for each week", () => {
    const data = calculateBurndownData(mockProjects, 5);
    expect(data.length).toBe(52);
  });

  it("has ideal line decreasing linearly", () => {
    const data = calculateBurndownData(mockProjects, 10);
    expect(data[0].ideal).toBe(51); // Week 1: 52 - (1 * 52/52) = 51
    expect(data[51].ideal).toBe(0); // Week 52: 0
  });

  it("has actual line reflecting project completions", () => {
    const data = calculateBurndownData(mockProjects, 10);
    // By week 2, we should have 2 projects (Project A in week 2, Project B in week 3)
    // Actual = 52 - cumulative projects
    expect(data[0].actual).toBe(52); // Week 1: no projects yet
  });
});

describe("calculatePaceStatus", () => {
  it("calculates ahead status correctly", () => {
    // If we're in week 2 and have 3 projects (expected ~2), we're ahead
    const earlyDate = new Date(2026, 0, 10); // Week 2
    const result = calculatePaceStatus(mockProjects, earlyDate);

    expect(result.actual).toBe(3);
    expect(result.status).toBe("ahead");
  });

  it("calculates behind status correctly", () => {
    // Mock late in year with few projects
    const lateDate = new Date(2026, 5, 15); // Week ~25, expected ~25 projects
    const fewProjects: Project[] = [
      {
        name: "Only One",
        route: "/one",
        createdAt: "2026-01-01",
        hidden: false,
        external: false,
      },
    ];
    const result = calculatePaceStatus(fewProjects, lateDate);

    expect(result.actual).toBe(1);
    expect(result.status).toBe("behind");
    expect(result.difference).toBeGreaterThan(0);
  });

  it("includes weeks remaining calculation", () => {
    const midYear = new Date(2026, 5, 15);
    const result = calculatePaceStatus(mockProjects, midYear);

    expect(result.weeksRemaining).toBeLessThan(52);
    expect(result.weeksRemaining).toBeGreaterThan(0);
  });
});

describe("groupProjectsByMonth", () => {
  it("returns 12 months", () => {
    const result = groupProjectsByMonth(mockProjects);
    expect(result).toHaveLength(12);
  });

  it("correctly groups January projects", () => {
    const result = groupProjectsByMonth(mockProjects);
    const january = result.find((m) => m.month === "January");
    expect(january?.count).toBe(2); // Project A and B
  });

  it("correctly groups February projects", () => {
    const result = groupProjectsByMonth(mockProjects);
    const february = result.find((m) => m.month === "February");
    expect(february?.count).toBe(1); // Project C
  });
});

describe("groupProjectsByCategory", () => {
  it("counts categories across projects", () => {
    const result = groupProjectsByCategory(mockProjects);

    const gameCategory = result.find((c) => c.category === "game");
    expect(gameCategory?.count).toBe(2); // Project B and C

    const toolCategory = result.find((c) => c.category === "tool");
    expect(toolCategory?.count).toBe(1); // Project A
  });

  it("calculates percentages", () => {
    const result = groupProjectsByCategory(mockProjects);
    const totalPercentage = result.reduce((sum, c) => sum + c.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 1);
  });

  it("sorts by count descending", () => {
    const result = groupProjectsByCategory(mockProjects);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].count).toBeGreaterThanOrEqual(result[i].count);
    }
  });
});

describe("calculateStats", () => {
  it("calculates total 2026 projects", () => {
    const result = calculateStats(mockProjects);
    expect(result.totalProjects).toBe(3);
  });

  it("calculates current week", () => {
    const date = new Date(2026, 0, 10);
    const result = calculateStats(mockProjects, date);
    expect(result.currentWeek).toBe(2);
  });

  it("calculates average pace", () => {
    const date = new Date(2026, 0, 14); // Week 3
    const result = calculateStats(mockProjects, date);
    expect(result.averagePace).toBeGreaterThan(0);
  });
});

describe("getTimelineProjects", () => {
  it("returns only 2026 projects with timeline data", () => {
    const result = getTimelineProjects(mockProjects);
    expect(result).toHaveLength(3);
    expect(result.every((p) => "weekNumber" in p && "dayOfYear" in p)).toBe(
      true,
    );
  });

  it("sorts by day of year", () => {
    const result = getTimelineProjects(mockProjects);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].dayOfYear).toBeLessThanOrEqual(result[i].dayOfYear);
    }
  });
});

describe("getCategoryColor", () => {
  it("returns correct colors for known categories", () => {
    expect(getCategoryColor("game")).toBe("#ef4444");
    expect(getCategoryColor("tool")).toBe("#3b82f6");
    expect(getCategoryColor("creative")).toBe("#a855f7");
  });
});

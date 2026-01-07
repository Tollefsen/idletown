"use client";

import { BackLink, Container, Heading, Text } from "@/app/components";
import { PROJECTS } from "@/app/config/constants";
import { BurndownChart } from "./components/BurndownChart";
import { CategoryBreakdown } from "./components/CategoryBreakdown";
import { PaceIndicator } from "./components/PaceIndicator";
import { ProjectsTimeline } from "./components/ProjectsTimeline";
import { StatsGrid } from "./components/StatsGrid";
import {
  calculateBurndownData,
  calculatePaceStatus,
  calculateStats,
  getTimelineProjects,
  groupProjectsByCategory,
  groupProjectsByMonth,
} from "./utils";

export default function YearOfVibePage() {
  const now = new Date();
  const stats = calculateStats(PROJECTS, now);
  const pace = calculatePaceStatus(PROJECTS, now);
  const burndownData = calculateBurndownData(PROJECTS, stats.currentWeek);
  const monthlyData = groupProjectsByMonth(PROJECTS);
  const categoryData = groupProjectsByCategory(PROJECTS);
  const timelineProjects = getTimelineProjects(PROJECTS);

  return (
    <Container size="xl" className="py-8">
      <BackLink href="/" className="mb-6" />

      <header className="mb-8">
        <Heading as="h1" size="h1" className="mb-2">
          Year of Vibe
        </Heading>
        <Text color="muted" size="lg">
          Tracking 52 projects in 2026
        </Text>
      </header>

      <div className="space-y-8">
        {/* Summary Stats */}
        <section>
          <StatsGrid stats={stats} />
        </section>

        {/* Pace Indicator */}
        <section>
          <PaceIndicator pace={pace} />
        </section>

        {/* Burndown Chart */}
        <section>
          <BurndownChart data={burndownData} currentWeek={stats.currentWeek} />
        </section>

        {/* Two column layout for smaller charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <section>
            <CategoryBreakdown data={categoryData} />
          </section>

          {/* Monthly breakdown could go here in the future */}
        </div>

        {/* Projects Timeline */}
        <section>
          <ProjectsTimeline
            projects={timelineProjects}
            monthlyData={monthlyData}
            currentWeek={stats.currentWeek}
          />
        </section>
      </div>
    </Container>
  );
}

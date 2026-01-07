"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/app/components";
import type { BurndownDataPoint } from "../types";

interface BurndownChartProps {
  data: BurndownDataPoint[];
  currentWeek: number;
}

export function BurndownChart({ data, currentWeek }: BurndownChartProps) {
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: BurndownDataPoint }>;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Week {d.week}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ideal remaining:{" "}
          <span className="text-blue-600 dark:text-blue-400">
            {d.ideal.toFixed(0)}
          </span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Actual remaining:{" "}
          <span className="text-green-600 dark:text-green-400">
            {d.actual.toFixed(0)}
          </span>
        </p>
      </div>
    );
  };

  return (
    <Card padding="lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Burndown Chart
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Projects remaining vs ideal pace over 52 weeks
      </p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => (v % 4 === 0 ? `W${v}` : "")}
              label={{
                value: "Week",
                position: "insideBottom",
                offset: -5,
                fontSize: 12,
                fill: "#6b7280",
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              width={40}
              domain={[0, 52]}
              label={{
                value: "Projects Remaining",
                angle: -90,
                position: "insideLeft",
                fontSize: 12,
                fill: "#6b7280",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Ideal pace line */}
            <Line
              type="linear"
              dataKey="ideal"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Ideal Pace"
            />

            {/* Actual progress line */}
            <Line
              type="stepAfter"
              dataKey="actual"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Actual Progress"
            />

            {/* Current week marker */}
            <ReferenceLine
              x={currentWeek}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{
                value: "Now",
                position: "top",
                fill: "#ef4444",
                fontSize: 12,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

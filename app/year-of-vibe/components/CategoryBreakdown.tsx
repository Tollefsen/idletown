"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/app/components";
import type { CategoryData } from "../types";
import { getCategoryColor } from "../utils";

interface CategoryBreakdownProps {
  data: CategoryData[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: CategoryData }>;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
          {d.category}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {d.count} project{d.count !== 1 ? "s" : ""} ({d.percentage.toFixed(0)}
          %)
        </p>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Category Breakdown
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No projects with categories yet.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Category Breakdown
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Projects can have multiple categories
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={getCategoryColor(entry.category)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {data.map((cat) => (
          <div key={cat.category} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: getCategoryColor(cat.category) }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {cat.category}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

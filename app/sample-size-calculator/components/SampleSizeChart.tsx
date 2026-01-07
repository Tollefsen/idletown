"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "../types";

interface SampleSizeChartProps {
  data: ChartDataPoint[];
  currentMde: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toFixed(0);
}

function formatFullNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function SampleSizeChart({ data, currentMde }: SampleSizeChartProps) {
  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ChartDataPoint }>;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
          {d.mdePercent}% MDE
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          {formatFullNumber(d.sampleSize)} per variation
        </p>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        No data to display
      </div>
    );
  }

  const currentMdePercent = Math.round(currentMde * 100);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="mdePercent"
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 12 }}
            label={{
              value: "Minimum Detectable Effect",
              position: "insideBottom",
              offset: -5,
              fontSize: 12,
              fill: "#6b7280",
            }}
          />
          <YAxis
            tickFormatter={formatNumber}
            tick={{ fontSize: 12 }}
            width={50}
            label={{
              value: "Sample Size",
              angle: -90,
              position: "insideLeft",
              fontSize: 12,
              fill: "#6b7280",
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Main line */}
          <Line
            type="monotone"
            dataKey="sampleSize"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: "#3b82f6" }}
          />

          {/* Reference line for current MDE */}
          <ReferenceLine
            x={currentMdePercent}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend / Current selection indicator */}
      <div className="mt-2 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">
            Sample size curve
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-0.5 bg-red-500 border-dashed"
            style={{ borderTopWidth: 2, borderTopStyle: "dashed" }}
          />
          <span className="text-gray-600 dark:text-gray-400">
            Your MDE ({currentMdePercent}%)
          </span>
        </div>
      </div>
    </div>
  );
}

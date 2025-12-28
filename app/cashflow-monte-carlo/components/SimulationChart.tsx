"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyStats } from "../types";

type SimulationChartProps = {
  data: MonthlyStats[];
  currency: string;
  showYearly?: boolean;
};

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatXAxis(month: number, showYearly: boolean): string {
  if (showYearly) {
    return `Y${Math.floor(month / 12) + 1}`;
  }
  return `M${month + 1}`;
}

export function SimulationChart({
  data,
  currency,
  showYearly = false,
}: SimulationChartProps) {
  // Transform data for the stacked area chart
  // We need to create "bands" for the confidence intervals
  const chartData = data.map((stats) => {
    const label = showYearly
      ? `Year ${Math.floor(stats.month / 12) + 1}`
      : `Month ${stats.month + 1}`;

    return {
      month: stats.month,
      label,
      // For stacked areas, we need the difference between percentiles
      p5_p10: stats.p10 - stats.p5,
      p10_p25: stats.p25 - stats.p10,
      p25_p50: stats.p50 - stats.p25,
      p50_p75: stats.p75 - stats.p50,
      p75_p90: stats.p90 - stats.p75,
      p90_p95: stats.p95 - stats.p90,
      // Base value (everything stacks on top of p5)
      base: stats.p5,
      // Actual values for tooltip
      p5: stats.p5,
      p10: stats.p10,
      p25: stats.p25,
      p50: stats.p50,
      p75: stats.p75,
      p90: stats.p90,
      p95: stats.p95,
      mean: stats.mean,
    };
  });

  // Filter to show fewer points if yearly view
  const filteredData = showYearly
    ? chartData.filter(
        (d) => d.month % 12 === 0 || d.month === chartData.length - 1,
      )
    : chartData;

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: (typeof chartData)[0] }>;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium mb-2">{d.label}</p>
        <div className="text-sm space-y-1">
          <p className="text-red-600">P95: {formatCurrency(d.p95, currency)}</p>
          <p className="text-orange-500">
            P90: {formatCurrency(d.p90, currency)}
          </p>
          <p className="text-yellow-600">
            P75: {formatCurrency(d.p75, currency)}
          </p>
          <p className="text-green-600 font-medium">
            P50 (Median): {formatCurrency(d.p50, currency)}
          </p>
          <p className="text-yellow-600">
            P25: {formatCurrency(d.p25, currency)}
          </p>
          <p className="text-orange-500">
            P10: {formatCurrency(d.p10, currency)}
          </p>
          <p className="text-red-600">P5: {formatCurrency(d.p5, currency)}</p>
          <p className="text-blue-600 mt-2">
            Mean: {formatCurrency(d.mean, currency)}
          </p>
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        Run a simulation to see results
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={filteredData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="month"
            tickFormatter={(m) => formatXAxis(m, showYearly)}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v, currency)}
            tick={{ fontSize: 12 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Stacked areas from bottom to top */}
          {/* Base layer (P5) */}
          <Area
            type="monotone"
            dataKey="base"
            stackId="1"
            stroke="transparent"
            fill="transparent"
            name="Base"
            legendType="none"
          />

          {/* P5 to P10 band */}
          <Area
            type="monotone"
            dataKey="p5_p10"
            stackId="1"
            stroke="transparent"
            fill="#ef4444"
            fillOpacity={0.2}
            name="P5-P10"
          />

          {/* P10 to P25 band */}
          <Area
            type="monotone"
            dataKey="p10_p25"
            stackId="1"
            stroke="transparent"
            fill="#f97316"
            fillOpacity={0.3}
            name="P10-P25"
          />

          {/* P25 to P50 band */}
          <Area
            type="monotone"
            dataKey="p25_p50"
            stackId="1"
            stroke="transparent"
            fill="#22c55e"
            fillOpacity={0.4}
            name="P25-P50"
          />

          {/* P50 to P75 band */}
          <Area
            type="monotone"
            dataKey="p50_p75"
            stackId="1"
            stroke="transparent"
            fill="#22c55e"
            fillOpacity={0.4}
            name="P50-P75"
          />

          {/* P75 to P90 band */}
          <Area
            type="monotone"
            dataKey="p75_p90"
            stackId="1"
            stroke="transparent"
            fill="#f97316"
            fillOpacity={0.3}
            name="P75-P90"
          />

          {/* P90 to P95 band */}
          <Area
            type="monotone"
            dataKey="p90_p95"
            stackId="1"
            stroke="transparent"
            fill="#ef4444"
            fillOpacity={0.2}
            name="P90-P95"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

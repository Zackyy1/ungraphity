import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import React, { type ReactNode } from "react";

export type ChartType = "area" | "line" | "bar" | "composed";

export interface ChartDataPoint {
  date: string;
  value: number;
  displayDate: string;
  fullDate: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  color: string;
  CustomTooltip: (props: any) => ReactNode;
}

/**
 * Transform records data for chart display
 * This ensures consistent data format across all chart types
 */
export function transformRecordsForChart(
  records: Array<{
    date?: string;
    value: number;
    displayDate?: string;
    fullDate?: string;
    recordedAt?: Date;
  }>
): ChartDataPoint[] {
  return records.map((record) => ({
    date: record.date || (record.recordedAt ? record.recordedAt.toISOString().split('T')[0] : ''),
    value: record.value,
    displayDate: record.displayDate || '',
    fullDate: record.fullDate || '',
  }));
}

/**
 * Render chart based on chart type
 */
export function renderChart(
  chartType: ChartType | null | undefined,
  props: ChartProps
): ReactNode {
  const { data, color, CustomTooltip } = props;
  const defaultType: ChartType = "area";

  const chartTypeToUse = chartType || defaultType;

  const commonProps = {
    data,
    margin: {
      top: 20,
      right: 30,
      left: 20,
      bottom: 20,
    },
  };

  const axisProps = {
    XAxis: {
      dataKey: "displayDate",
      stroke: "hsl(var(--muted-foreground))",
      fontSize: 12,
      tickLine: false,
      axisLine: false,
    },
    YAxis: {
      stroke: "hsl(var(--muted-foreground))",
      fontSize: 12,
      tickLine: false,
      axisLine: false,
    },
  };

  const gridProps = {
    strokeDasharray: "3 3",
    stroke: "hsl(var(--muted))",
    opacity: 0.3,
  };

  switch (chartTypeToUse) {
    case "line":
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.3} />
                <stop offset="95%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis {...axisProps.XAxis} />
            <YAxis {...axisProps.YAxis} />
            <Tooltip content={CustomTooltip} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={`hsl(var(--${color}))`}
              strokeWidth={3}
              dot={{ fill: `hsl(var(--${color}))`, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: `hsl(var(--${color}))`, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case "bar":
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis {...axisProps.XAxis} />
            <YAxis {...axisProps.YAxis} />
            <Tooltip content={CustomTooltip} />
            <Bar
              dataKey="value"
              fill={`hsl(var(--${color}))`}
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(var(--${color}))`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

    case "composed":
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.3} />
                <stop offset="95%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis {...axisProps.XAxis} />
            <YAxis {...axisProps.YAxis} />
            <Tooltip content={CustomTooltip} />
            <Area
              type="monotone"
              dataKey="value"
              fill={`url(#gradient-${color})`}
              stroke="none"
            />
            <Bar
              dataKey="value"
              fill={`hsl(var(--${color}))`}
              radius={[4, 4, 0, 0]}
              opacity={0.6}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={`hsl(var(--${color}))`}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      );

    case "area":
    default:
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.3} />
                <stop offset="95%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis {...axisProps.XAxis} />
            <YAxis {...axisProps.YAxis} />
            <Tooltip content={CustomTooltip} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={`hsl(var(--${color}))`}
              strokeWidth={3}
              fill={`url(#gradient-${color})`}
              dot={{ fill: `hsl(var(--${color}))`, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: `hsl(var(--${color}))`, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
  }
}


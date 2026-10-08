import { memo, useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useBreakpoint from "@/hooks/useBreakpoint";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#ef4444",
  "#64748b",
  "#075985",
];

const ANIMATION_MS = 800;
const compactFormatter = new Intl.NumberFormat("en-PK", { notation: "compact", maximumFractionDigits: 1 });

function ChartFrame({ children, className = "" }) {
  return (
    <div className={`min-h-[16rem] w-full min-w-0 sm:min-h-[18rem] ${className}`}>
      {children}
    </div>
  );
}

export const TrendChart = memo(function TrendChart({ data, xKey, primary, secondary, primaryLabel, secondaryLabel }) {
  const { md } = useBreakpoint();
  return (
    <ChartFrame className="h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: md ? 8 : 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            interval={md ? 0 : "preserveStartEnd"}
            angle={md ? 0 : -30}
            textAnchor={md ? "middle" : "end"}
            height={md ? 30 : 50}
            tick={{ fill: "var(--color-text-secondary)", fontSize: md ? 12 : 10 }}
          />
          <YAxis
            width={md ? 48 : 36}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-text-secondary)", fontSize: md ? 12 : 10 }}
            tickFormatter={(value) => compactFormatter.format(value)}
          />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-bg-surface-raised)", color: "var(--color-text-primary)" }} />
          <Legend verticalAlign={md ? "top" : "bottom"} wrapperStyle={{ paddingTop: md ? 0 : 8 }} />
          <Bar dataKey={primary} name={primaryLabel} fill="var(--chart-1)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={ANIMATION_MS} />
          <Bar dataKey={secondary} name={secondaryLabel} fill="var(--chart-2)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={ANIMATION_MS} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
});

function DistributionLegend({ payload, activeIndex, onHover, onLeave }) {
  if (!payload?.length) return null;

  return (
    <ul className="flex flex-row flex-wrap justify-center gap-1.5 pt-1">
      {payload.map((entry, index) => {
        const isActive = activeIndex === index;
        const isDimmed = activeIndex != null && !isActive;
        return (
          <li key={entry.value}>
            <button
              type="button"
              className={`flex min-h-10 items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-small transition-all duration-200 ${
                isActive
                  ? "bg-gold-soft font-semibold text-accent ring-1 ring-accent/25"
                  : isDimmed
                    ? "text-muted opacity-45"
                    : "text-secondary hover:bg-slate-50"
              }`}
              onMouseEnter={() => onHover(index)}
              onMouseLeave={onLeave}
              onFocus={() => onHover(index)}
              onBlur={onLeave}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  background: entry.color,
                  boxShadow: isActive ? `0 0 0 3px color-mix(in srgb, ${entry.color} 28%, transparent)` : undefined,
                }}
                aria-hidden="true"
              />
              <span className="truncate">{entry.value}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export const DistributionChart = memo(function DistributionChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const chartData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const clearActive = useCallback(() => setActiveIndex(null), []);
  const setActive = useCallback((index) => setActiveIndex(index), []);
  const onSectorEnter = useCallback((_, index) => setActiveIndex(index), []);

  // Always: centered pie on top + wrapped legend below (same as mobile; avoids side-legend cropping).
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="h-56 w-full min-w-0 sm:h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="42%"
              outerRadius="72%"
              paddingAngle={3}
              isAnimationActive
              animationDuration={ANIMATION_MS}
              onMouseEnter={onSectorEnter}
              onMouseLeave={clearActive}
            >
              {chartData.map((item, index) => {
                const isActive = activeIndex === index;
                const isDimmed = activeIndex != null && !isActive;
                return (
                  <Cell
                    key={item.label}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke={isActive ? "#0369A1" : "#fff"}
                    strokeWidth={isActive ? 2 : 1}
                    opacity={isDimmed ? 0.35 : 1}
                    style={{
                      cursor: "pointer",
                      outline: "none",
                      transition: "opacity 180ms ease, stroke-width 180ms ease",
                      filter: isActive ? "drop-shadow(0 2px 6px rgb(3 105 161 / 0.35))" : undefined,
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-bg-surface-raised)", color: "var(--color-text-primary)" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <DistributionLegend
        payload={chartData.map((item, index) => ({
          value: item.label,
          color: CHART_COLORS[index % CHART_COLORS.length],
        }))}
        activeIndex={activeIndex}
        onHover={setActive}
        onLeave={clearActive}
      />
    </div>
  );
});

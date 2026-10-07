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

export const TrendChart = memo(function TrendChart({ data, xKey, primary, secondary, primaryLabel, secondaryLabel }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} tickFormatter={(value) => compactFormatter.format(value)} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-bg-surface-raised)", color: "var(--color-text-primary)" }} />
          <Legend />
          <Bar
            dataKey={primary}
            name={primaryLabel}
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={ANIMATION_MS}
          />
          <Bar
            dataKey={secondary}
            name={secondaryLabel}
            fill="var(--chart-2)"
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={ANIMATION_MS}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

function DistributionLegend({ payload, activeIndex, onHover, onLeave }) {
  if (!payload?.length) return null;

  return (
    <ul className="flex flex-col gap-1.5 pl-2">
      {payload.map((entry, index) => {
        const isActive = activeIndex === index;
        const isDimmed = activeIndex != null && !isActive;
        return (
          <li key={entry.value}>
            <button
              type="button"
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-small transition-all duration-200 ${
                isActive
                  ? "bg-[#ECFDF5] font-semibold text-[#0369A1] ring-1 ring-[#0369A1]/25"
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

  const onSectorEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="label"
            cx="45%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
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
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            content={(props) => (
              <DistributionLegend
                payload={props.payload}
                activeIndex={activeIndex}
                onHover={setActive}
                onLeave={clearActive}
              />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

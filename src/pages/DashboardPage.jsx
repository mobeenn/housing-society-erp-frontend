import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  MessageSquareWarning,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { Card, ProgressBar, StatusPill } from "@/components/ui";
import LowStockWidget from "@/components/dashboard/LowStockWidget";
import { getRoleDashboard } from "@/features/dashboards/dashboardsApi";
import { useAuthStore } from "@/store/authStore";
import { roleLabel } from "@/lib/permissions";
import { useCan, useRbacAccess } from "@/hooks/useCan";
import useVisibilityRefetchInterval from "@/hooks/useVisibilityRefetchInterval";

const TrendChart = lazy(() =>
  import("./DashboardCharts").then((module) => ({ default: module.TrendChart })),
);
const DistributionChart = lazy(() =>
  import("./DashboardCharts").then((module) => ({ default: module.DistributionChart })),
);

const currencyFormatter = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
const numberFormatter = new Intl.NumberFormat("en-PK");

const formatValue = (value, format) => {
  if (format === "currency") return currencyFormatter.format(Number(value || 0));
  if (format === "percent") return `${Number(value || 0).toFixed(1)}%`;
  return numberFormatter.format(Number(value || 0));
};
const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-PK", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value))
    : "—";

const trendConfig = {
  management: { data: "financialTrend", primary: "collected", secondary: "billed", x: "month", primaryLabel: "Collected", secondaryLabel: "Billed" },
  finance: { data: "financialTrend", primary: "collected", secondary: "billed", x: "month", primaryLabel: "Collected", secondaryLabel: "Billed" },
  operations: { data: "complaintTrend", primary: "created", secondary: "resolved", x: "month", primaryLabel: "Created", secondaryLabel: "Resolved" },
  security: { data: "visitorTrend", primary: "entries", secondary: "active", x: "day", primaryLabel: "Entries", secondaryLabel: "Active" },
  property: { data: "blockOccupancy", primary: "occupancyRate", secondary: "available", x: "block", primaryLabel: "Occupied %", secondaryLabel: "Available" },
};

const distributionConfig = {
  management: "plotStatus",
  finance: "duesStatus",
  operations: "complaintStatus",
  security: "gateBreakdown",
  property: "plotStatus",
};

function LoadingState() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="erp-skeleton h-32 rounded-card" aria-label="Loading dashboard statistic" role="status" />
      ))}
    </div>
  );
}

function StatCard({ stat }) {
  const iconMap = {
    members: Users,
    plots: Building2,
    collection: Banknote,
    dues: Wallet,
    openComplaints: MessageSquareWarning,
    workOrders: Wrench,
    visitorsToday: UserCheck,
    guards: ShieldCheck,
    employees: BriefcaseBusiness,
  };
  const Icon = iconMap[stat.key] || BarChart3;
  const isPercent = stat.format === "percent";
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-body text-secondary">{stat.label}</p>
          <p className="mt-2 text-h1 font-bold text-primary">{formatValue(stat.value, stat.format)}</p>
          {isPercent && (
            <ProgressBar value={Number(stat.value) || 0} className="mt-3" />
          )}
        </div>
        <span className="rounded-card bg-gold-soft p-2.5 text-accent">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

function ListCard({ title, items, type }) {
  const isPayment = type === "payments";
  const isComplaint = type === "complaints";
  const href = (item) =>
    isPayment
      ? `/payments/${item._id}`
      : isComplaint
        ? `/complaints/${item._id}`
        : type === "defaulters"
          ? `/members/${item.memberId}`
          : type === "visitors"
            ? "/security/visitors/history"
            : type === "transfers"
              ? `/transfers/${item._id}`
              : "/dashboard";
  return (
    <Card title={title}>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="py-5 text-center text-body text-muted">No records available.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item._id || item.complaintNumber || item.memberId}
              to={href(item)}
              className="block rounded-control border border-border p-3 hover:border-gold hover:bg-gold-soft/30"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-body font-medium text-primary">
                  {isPayment
                    ? item.memberName || item.receiptNumber
                    : isComplaint
                      ? item.complaintNumber || "Complaint"
                      : item.memberName || item.name}
                </p>
                {item.status && <StatusPill status={item.status} />}
              </div>
              <p className="mt-1 truncate text-small text-muted">
                {isPayment
                  ? `${item.receiptNumber} · ${formatValue(item.amount, "currency")}`
                  : isComplaint
                    ? `${item.category} · ${formatDate(item.createdAt)}`
                    : item.subtitle || item.email || ""}
              </p>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const rbacAccess = useRbacAccess();
  const canViewReports = useCan("reports", "view");
  const canViewNotices = useCan("notices", "view");
  const canViewInventory = useCan("inventory", "view");
  const dashboardType = rbacAccess.dashboardType || "management";
  const refetchInterval = useVisibilityRefetchInterval(5 * 60_000);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["role-dashboard", dashboardType, user?._id],
    queryFn: () => getRoleDashboard(dashboardType),
    enabled: Boolean(user),
    refetchInterval,
    placeholderData: (previous) => previous,
  });

  if (isLoading) return <LoadingState />;
  if (isError) {
    return (
      <Card>
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-danger" />
          <p className="mt-3 font-semibold">Dashboard data could not be loaded.</p>
          <button onClick={() => refetch()} className="mt-3 text-body text-accent underline">
            Retry
          </button>
        </div>
      </Card>
    );
  }

  const { stats = [], charts = {}, lists = {}, lowStock = [] } = data;
  const trend = trendConfig[dashboardType];
  const trendData = charts[trend.data] || [];
  const distribution = charts[distributionConfig[dashboardType]] || [];
  const listConfig =
    dashboardType === "finance"
      ? { title: "Top Defaulters", items: lists.defaulters || [], type: "defaulters" }
      : dashboardType === "security"
        ? { title: "Recent Visitors", items: lists.recentVisitors || [], type: "visitors" }
        : dashboardType === "property"
          ? { title: "Recent Transfers", items: lists.recentTransfers || [], type: "transfers" }
          : { title: "Open Complaints", items: lists.openComplaints || [], type: "complaints" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 font-bold text-primary" data-tour="dashboards-page">
              {roleLabel(user)} Dashboard
            </h1>
            <span className="rounded-full bg-success-soft px-2.5 py-1 text-small font-medium text-success">
              Live backend data
            </span>
          </div>
          <p className="mt-1 text-body text-secondary" data-tour="inventory-dashboard">
            Role-specific operational overview for {roleLabel(user)}.
          </p>
        </div>
        <p className="text-small text-muted">Updated {formatDate(data.generatedAt)}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" data-tour="dashboards-stats">
        {stats.map((stat) => (
          <StatCard key={stat.key} stat={stat} />
        ))}
      </div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-3" data-tour="dashboards-charts">
        <Card title="Trend" className="min-w-0 lg:col-span-2">
          <Suspense fallback={<div className="erp-skeleton h-64 rounded-control sm:h-72" />}>
            <TrendChart
              data={trendData}
              xKey={trend.x}
              primary={trend.primary}
              secondary={trend.secondary}
              primaryLabel={trend.primaryLabel}
              secondaryLabel={trend.secondaryLabel}
            />
          </Suspense>
        </Card>
        <Card title="Distribution" className="min-w-0">
          <Suspense fallback={<div className="erp-skeleton h-64 rounded-control sm:h-72" />}>
            <DistributionChart data={distribution} />
          </Suspense>
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2" data-tour="dashboards-lists">
        <ListCard {...listConfig} />
        {lowStock.length > 0 || dashboardType === "management" || dashboardType === "operations" ? (
          canViewInventory && <LowStockWidget items={lowStock} />
        ) : (
          <Card title="Quick Links">
            <div className="grid gap-2 sm:grid-cols-2">
              {canViewReports && (
                <Link to="/reports" className="rounded-control border border-border p-3 text-body font-medium text-accent hover:bg-gold-soft">
                  Open Reports
                </Link>
              )}
              {canViewNotices && (
                <Link to="/notices" className="rounded-control border border-border p-3 text-body font-medium text-accent hover:bg-gold-soft">
                  View Notices
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
      {canViewReports && (
        <p className="text-small text-muted">Use the Reports hub for detailed cross-module analysis and exports.</p>
      )}
    </div>
  );
}

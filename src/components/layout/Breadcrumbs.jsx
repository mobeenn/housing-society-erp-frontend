import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import TourLauncherButton from "@/tours/TourLauncherButton";
import { getTourModuleForPath } from "@/tours/registry";

const labelMap = {
  dashboard: "Dashboard",
  members: "Members",
  plots: "Plots / Units",
  invoicing: "Invoicing",
  invoices: "Invoices",
  recovery: "Recovery",
  portal: "Portal",
  overdue: "Overdue Installments",
  "overdue-installments": "Overdue Installments",
  payments: "Payments",
  complaints: "Complaints",
  maintenance: "Maintenance",
  assets: "Assets",
  notices: "Notice Board",
  reports: "Reports Hub",
  settings: "Settings",
  hr: "HR & Staff",
  payroll: "Payroll",
  loans: "Employee Loans",
  setup: "Setup",
  "plot-merge": "Plot Merge",
  buyback: "Buyback / Cancel",
  registry: "Paperwork Registry",
  appointments: "Appointments",
  today: "Today",
  logs: "Logs",
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-small text-muted">
      <Link to="/dashboard" aria-label="Dashboard" className="rounded-control p-1 text-muted transition-colors duration-fast hover:bg-surface-muted hover:text-primary">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = index === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            {isLast ? <span className="font-semibold text-primary">{label}</span> : <Link to={path} className="rounded-control px-1 py-0.5 transition-colors duration-fast hover:text-primary">{label}</Link>}
          </span>
        );
      })}
      {getTourModuleForPath(pathname) && <TourLauncherButton moduleKey={getTourModuleForPath(pathname)} compact />}
    </nav>
  );
}

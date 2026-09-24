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
    <nav className="flex items-center gap-1 text-sm text-neutral-500">
      <Link to="/dashboard" className="hover:text-primary-600">
        <Home className="h-4 w-4" />
      </Link>

      {segments.map((seg, idx) => {
        const path = "/" + segments.slice(0, idx + 1).join("/");
        const label =
          labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
        const isLast = idx === segments.length - 1;

        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
            {isLast ? (
              <span className="font-medium text-neutral-900">{label}</span>
            ) : (
              <Link to={path} className="hover:text-primary-600">
                {label}
              </Link>
            )}
          </span>
        );
      })}
      {getTourModuleForPath(pathname) && <TourLauncherButton moduleKey={getTourModuleForPath(pathname)} compact />}
    </nav>
  );
}

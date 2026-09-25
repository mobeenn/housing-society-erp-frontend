import { NavLink, Outlet } from "react-router-dom";
import { Banknote, FileBarChart, Landmark, Settings2, WalletCards } from "lucide-react";

const links = [
  { to: "/hr/payroll", label: "Payroll Runs", icon: Banknote, end: true },
  { to: "/hr/payroll/loans", label: "Employee Loans", icon: WalletCards },
  { to: "/hr/payroll/setup", label: "Statutory Setup", icon: Settings2 },
  { to: "/hr/payroll/reports", label: "Payroll Reports", icon: FileBarChart },
];

export default function PayrollLayout() {
  return (
    <div className="space-y-6" data-tour="hr-payroll-layout">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-body text-secondary">
          <Landmark className="h-4 w-4" />
          Human Resources / Payroll
        </div>
        <h1 className="text-h1 font-bold text-primary">Payroll &amp; Employee Finance</h1>
        <p className="text-body text-secondary">Manage salary structures, statutory deductions, loans, and payroll approvals.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border" data-tour="hr-payroll-nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-body font-medium transition-colors ${isActive ? "border-accent text-accent" : "border-transparent text-secondary hover:border-border-strong hover:text-primary"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}

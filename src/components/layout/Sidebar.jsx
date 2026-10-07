import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  ArrowRightLeft,
  BadgeDollarSign,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  CalendarCheck,
  CalendarClock,
  Car,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Combine,
  FileCheck,
  FileText,
  FolderOpen,
  Hand,
  Handshake,
  HardHat,
  LayoutDashboard,
  Library,
  Map,
  MessageSquareWarning,
  Package,
  Receipt,
  RefreshCcw,
  SearchCheck,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Square,
  Undo2,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import CivicaLogo from "@/components/brand/CivicaLogo";
import { useAuthStore } from "@/store/authStore";

const ICON_MAP = {
  LayoutDashboard,
  Users,
  Map,
  ClipboardCheck,
  CalendarCheck,
  ArrowRightLeft,
  Hand,
  FileCheck,
  HardHat,
  Wallet,
  Undo2,
  Receipt,
  BarChart3,
  MessageSquareWarning,
  Wrench,
  Package,
  ShoppingCart,
  Boxes,
  Shield,
  Car,
  UserCheck,
  UserCog,
  Bell,
  Settings,
  ShieldCheck,
  Activity,
  FolderOpen,
  FileText,
  Handshake,
  SearchCheck,
  BookOpen,
  BadgeDollarSign,
  CalendarClock,
  Combine,
  RefreshCcw,
  Library,
};

function moduleIcon(name) {
  return ICON_MAP[name] || Square;
}

export default function Sidebar({ collapsed, onToggle }) {
  const access = useAuthStore((state) => state.access);
  const { pathname } = useLocation();

  const modules = useMemo(
    () =>
      (access?.modules || [])
        .filter((module) => module.isActive && module.isVisible && module.showInSidebar !== false && module.route)
        .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [access],
  );

  const groups = useMemo(
    () =>
      modules.reduce((result, module) => {
        const group = module.group || "General";
        (result[group] ||= []).push(module);
        return result;
      }, {}),
    [modules],
  );

  return (
    <aside
      className={`erp-shell-island fixed bottom-4 left-4 top-4 z-30 flex flex-col transition-[width] duration-base ${collapsed ? "w-[4.5rem]" : "w-[15.5rem]"}`}
    >
      <div className={`flex h-16 items-center border-b border-slate-100 ${collapsed ? "justify-center px-2" : "px-4"}`}>
        {collapsed ? (
          <CivicaLogo variant="mark" height={32} />
        ) : (
          <CivicaLogo variant="logo" height={32} />
        )}
      </div>

      <nav className="erp-sidebar-scroll relative flex-1 space-y-4 overflow-y-auto px-2 py-4">
        {Object.entries(groups).map(([group, groupModules]) => (
          <div key={group}>
            {!collapsed && (
              <div className="px-3 pb-2 text-label font-semibold uppercase tracking-wide text-muted">
                {group}
              </div>
            )}
            <div className="space-y-1">
              {groupModules.map((module) => {
                const Icon = moduleIcon(module.icon);
                return (
                  <NavLink
                    key={module.key}
                    to={module.route}
                    className={({ isActive }) => {
                      const active =
                        isActive ||
                        pathname === module.route ||
                        pathname.startsWith(`${module.route}/`);
                      return `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-body transition-colors duration-base ${
                        active
                          ? "border-l-4 border-[#0369A1] bg-[#ECFDF5] font-semibold text-[#0369A1]"
                          : "border-l-4 border-transparent font-medium text-muted hover:bg-slate-50 hover:text-primary"
                      }`;
                    }}
                    title={collapsed ? module.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="truncate">{module.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
        {modules.length === 0 && !collapsed && (
          <p className="px-3 py-4 text-small text-muted">No modules are assigned to this role.</p>
        )}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        className="flex h-12 items-center justify-center border-t border-slate-100 text-muted transition-colors duration-fast hover:text-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/40"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </aside>
  );
}

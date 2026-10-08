import { useEffect, useMemo } from "react";
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
  X,
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
  Building2,
};

function moduleIcon(name) {
  return ICON_MAP[name] || Square;
}

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  isDesktop = true,
  onToggle,
  onNavigate,
  onCloseMobile,
}) {
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

  useEffect(() => {
    if (isDesktop || !mobileOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onCloseMobile?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isDesktop, mobileOpen, onCloseMobile]);

  const showLabels = isDesktop ? !collapsed : true;
  const widthClass = isDesktop
    ? collapsed
      ? "w-[4.5rem]"
      : "w-[15.5rem]"
    : "w-[min(18rem,85vw)]";

  const positionClass = isDesktop
    ? "fixed bottom-4 left-4 top-4 z-30 translate-x-0"
    : `fixed bottom-0 left-0 top-0 z-50 rounded-none border-0 shadow-overlay transition-transform duration-base ${
        mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
      }`;

  return (
    <aside
      className={`erp-shell-island flex flex-col ${widthClass} ${positionClass}`}
      aria-hidden={!isDesktop && !mobileOpen}
    >
      <div className={`flex h-16 items-center border-b border-slate-100 ${showLabels ? "justify-between px-4" : "justify-center px-2"}`}>
        {showLabels ? (
          <CivicaLogo variant="logo" height={32} />
        ) : (
          <CivicaLogo variant="mark" height={32} />
        )}
        {!isDesktop && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-muted hover:bg-slate-50 hover:text-primary"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="erp-sidebar-scroll relative flex-1 space-y-4 overflow-y-auto px-2 py-4">
        {Object.entries(groups).map(([group, groupModules]) => (
          <div key={group}>
            {showLabels && (
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
                    onClick={() => onNavigate?.()}
                    className={({ isActive }) => {
                      const active =
                        isActive ||
                        pathname === module.route ||
                        pathname.startsWith(`${module.route}/`);
                      return `relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-body transition-colors duration-base ${
                        active
                          ? "border-l-4 border-accent bg-gold-soft font-semibold text-accent"
                          : "border-l-4 border-transparent font-medium text-muted hover:bg-slate-50 hover:text-primary"
                      }`;
                    }}
                    title={!showLabels ? module.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {showLabels && <span className="truncate">{module.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
        {modules.length === 0 && showLabels && (
          <p className="px-3 py-4 text-small text-muted">No modules are assigned to this role.</p>
        )}
      </nav>

      {isDesktop && (
        <button
          type="button"
          onClick={onToggle}
          className="flex h-12 min-h-11 items-center justify-center border-t border-slate-100 text-muted transition-colors duration-fast hover:text-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/40"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      )}
    </aside>
  );
}

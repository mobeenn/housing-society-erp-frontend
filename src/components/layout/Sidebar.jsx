import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const fallbackIcon = LucideIcons.Square || LucideIcons.Circle;

function moduleIcon(name) {
  return LucideIcons[name] || fallbackIcon;
}

export default function Sidebar({ collapsed, onToggle }) {
  const access = useAuthStore((state) => state.access);
  const { pathname } = useLocation();
  const navRef = useRef(null);
  const activeLinkRef = useRef(null);
  const [indicator, setIndicator] = useState({ top: 0, height: 0, visible: false });
  const modules = (access?.modules || [])
    .filter((module) => module.isActive && module.isVisible && module.showInSidebar !== false && module.route)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

  const groups = modules.reduce((result, module) => {
    const group = module.group || "General";
    (result[group] ||= []).push(module);
    return result;
  }, {});

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeLink = activeLinkRef.current;
      if (!activeLink) {
        setIndicator((current) => ({ ...current, visible: false }));
        return;
      }
      setIndicator({ top: activeLink.offsetTop, height: activeLink.offsetHeight, visible: true });
    };
    const frame = window.requestAnimationFrame(updateIndicator);
    window.addEventListener("resize", updateIndicator);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [collapsed, pathname, access]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar text-sidebar-text transition-[width] duration-base ${collapsed ? "w-16" : "w-60"}`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-hover px-4">
        <Building2 className="h-7 w-7 shrink-0 text-gold" aria-hidden="true" />
        {!collapsed && <span className="font-display text-body font-bold tracking-tight">Society ERP</span>}
      </div>

      <nav ref={navRef} className="relative flex-1 space-y-4 overflow-y-auto px-2 py-4">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 z-10 w-0.5 rounded-r-badge bg-gold transition-[top,height,opacity] duration-base ${indicator.visible ? "opacity-100" : "opacity-0"}`}
          style={{ top: indicator.top, height: indicator.height }}
        />
        {Object.entries(groups).map(([group, groupModules]) => (
          <div key={group}>
            {!collapsed && <div className="px-3 pb-2 text-label font-semibold text-sidebar-muted">{group}</div>}
            <div className="space-y-1">
              {groupModules.map((module) => {
                const Icon = moduleIcon(module.icon);
                const isCurrent = pathname === module.route || pathname.startsWith(`${module.route}/`);
                return (
                  <NavLink
                    key={module.key}
                    to={module.route}
                    ref={isCurrent ? activeLinkRef : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 rounded-control px-3 py-2.5 text-body font-medium transition-colors duration-base ${isActive ? "bg-sidebar-active/15 text-sidebar-text" : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text"}`
                    }
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
          <p className="px-3 py-4 text-small text-sidebar-muted">No modules are assigned to this role.</p>
        )}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        className="flex h-12 items-center justify-center border-t border-sidebar-hover text-sidebar-muted transition-colors duration-fast hover:text-sidebar-text focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold/50"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </aside>
  );
}

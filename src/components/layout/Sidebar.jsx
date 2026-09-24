import { NavLink } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const fallbackIcon = LucideIcons.Square || LucideIcons.Circle;

function moduleIcon(name) {
  return LucideIcons[name] || fallbackIcon;
}

export default function Sidebar({ collapsed, onToggle }) {
  const access = useAuthStore((state) => state.access);
  const modules = (access?.modules || [])
    .filter((module) => module.isActive && module.isVisible && module.showInSidebar !== false && module.route)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

  const groups = modules.reduce((result, module) => {
    const group = module.group || "General";
    (result[group] ||= []).push(module);
    return result;
  }, {});

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar text-white transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <Building2 className="h-7 w-7 shrink-0 text-primary-400" />
        {!collapsed && <span className="text-base font-bold tracking-tight">Society ERP</span>}
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4">
        {Object.entries(groups).map(([group, groupModules]) => (
          <div key={group}>
            {!collapsed && (
              <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
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
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-sidebar-active text-white" : "text-neutral-300 hover:bg-sidebar-hover hover:text-white"}`
                    }
                    title={collapsed ? module.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{module.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
        {modules.length === 0 && !collapsed && (
          <p className="px-3 py-4 text-xs text-neutral-400">No modules are assigned to this role.</p>
        )}
      </nav>

      <button
        onClick={onToggle}
        className="flex h-12 items-center justify-center border-t border-white/10 text-neutral-400 hover:text-white"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </aside>
  );
}

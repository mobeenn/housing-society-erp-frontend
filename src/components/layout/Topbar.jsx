import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronDown, LogOut, Moon, Search, Settings, Sun, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { authApi } from "@/features/auth/authApi";
import { notificationsApi } from "@/features/notifications/notificationsApi";
import { globalSearch } from "@/features/search/searchApi";
import { roleLabel } from "@/lib/permissions";
import { useCan } from "@/hooks/useCan";
import TourLauncherButton from "@/tours/TourLauncherButton";

const notificationRoute = (notification) => {
  const routes = {
    Booking: "/bookings",
    Payment: "/payments",
    Complaint: "/complaints",
    NocApplication: "/nocs",
    TransferRequest: "/transfers",
    PossessionApplication: "/possession",
    ConstructionApplication: "/construction",
    LeaveRequest: "/hr/leave-requests",
    Notice: "/notices",
    RecoveryAssignment: "/recovery",
  };
  const base = routes[notification.relatedEntityType];
  if (notification.eventType === "recovery.reminder") return "/recovery/overdue";
  if (notification.relatedEntityType === "RecoveryAssignment") return "/recovery";
  if (notification.relatedEntityType === "Notice") return "/notices";
  return notification.relatedEntityId && base ? `${base}/${notification.relatedEntityId}` : base || "/dashboard";
};

const initials = (name) => name?.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "?";

export default function Topbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const canViewSettings = useCan("settings", "view");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const close = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearch("");
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => notificationsApi.list({ limit: 8 }), enabled: Boolean(user), refetchInterval: 30000 });
  const searchResults = useQuery({ queryKey: ["global-search", debouncedSearch], queryFn: () => globalSearch(debouncedSearch), enabled: debouncedSearch.length >= 2 });
  const notificationItems = notifications.data?.data || [];

  const openResult = (result) => {
    setSearch("");
    setDebouncedSearch("");
    navigate(result.route);
  };

  const openNotification = async (notification) => {
    setShowNotifications(false);
    if (!notification.isRead) {
      await notificationsApi.markRead(notification._id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
    navigate(notificationRoute(notification));
  };

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* log out locally even if the API is unavailable */ }
    logout();
    queryClient.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-6">
      <div ref={searchRef} className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search members, plots, receipts..."
          className="w-full rounded-control border border-border bg-surface-muted py-2 pl-10 pr-9 text-body text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-control p-1 text-muted hover:bg-surface-raised hover:text-primary"><X className="h-3.5 w-3.5" /></button>}
        {debouncedSearch.length >= 2 && (
          <div className="erp-overlay-panel absolute left-0 right-0 top-12 z-50 max-h-96 overflow-y-auto rounded-card border border-border bg-surface-raised p-2 shadow-overlay">
            {searchResults.isFetching && <p className="px-3 py-4 text-body text-muted">Searching…</p>}
            {!searchResults.isFetching && searchResults.data?.groups?.length === 0 && <p className="px-3 py-4 text-body text-muted">No results found.</p>}
            {searchResults.data?.groups?.map((group) => (
              <div key={group.type} className="mb-2 last:mb-0">
                <p className="px-3 py-1.5 text-label font-semibold text-muted">{group.label}</p>
                {group.items.map((item) => (
                  <button key={`${item.type}-${item._id}`} onClick={() => openResult(item)} className="flex w-full items-center justify-between gap-3 rounded-control px-3 py-2 text-left hover:bg-surface-muted">
                    <span className="min-w-0"><span className="block truncate text-body font-medium text-primary">{item.title}</span><span className="block truncate text-small text-muted">{item.subtitle}</span></span>
                    <span className="text-small text-muted" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className="relative flex h-9 w-9 items-center justify-center rounded-control border border-border bg-surface-muted text-secondary transition-colors duration-fast hover:border-border-strong hover:bg-surface-raised hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <Sun className={`absolute h-4 w-4 transition-[opacity,transform] duration-base ${theme === "dark" ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} aria-hidden="true" />
          <Moon className={`absolute h-4 w-4 transition-[opacity,transform] duration-base ${theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"}`} aria-hidden="true" />
        </button>
        <TourLauncherButton />
        <div ref={notificationRef} className="relative">
          <button type="button" onClick={() => setShowNotifications((value) => !value)} className="relative rounded-control p-2 text-secondary transition-colors duration-fast hover:bg-surface-muted hover:text-primary" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {notifications.data?.unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-small font-bold text-on-accent">{notifications.data.unreadCount > 99 ? "99+" : notifications.data.unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="erp-overlay-panel absolute right-0 top-12 z-50 w-80 rounded-card border border-border bg-surface-raised shadow-overlay">
              <div className="flex items-center justify-between border-b border-border px-4 py-3"><p className="text-body font-semibold text-primary">Notifications</p><button type="button" onClick={async () => { await notificationsApi.markAllRead(); queryClient.invalidateQueries({ queryKey: ["notifications"] }); }} className="text-small font-semibold text-accent hover:underline">Mark all read</button></div>
              <div className="max-h-80 overflow-y-auto">
                {notificationItems.length === 0 ? <p className="px-4 py-8 text-center text-body text-muted">No notifications yet.</p> : notificationItems.map((notification) => (
                  <button key={notification._id} onClick={() => openNotification(notification)} className={`flex w-full gap-3 border-b border-border px-4 py-3 text-left hover:bg-surface-muted ${!notification.isRead ? "bg-gold-soft/40" : ""}`}>
                    <span className={`mt-1 h-2 w-2 rounded-full ${notification.isRead ? "bg-transparent" : "bg-accent"}`} />
                    <span className="min-w-0"><span className="block text-body font-medium text-primary">{notification.title}</span><span className="mt-0.5 block line-clamp-2 text-small text-secondary">{notification.message}</span></span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={userMenuRef} className="relative">
          <button type="button" onClick={() => setShowUserMenu((value) => !value)} className="flex items-center gap-2 rounded-control px-2 py-1.5 transition-colors duration-fast hover:bg-surface-muted">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-small font-semibold text-on-accent">{initials(user?.name)}</span>
            <span className="hidden text-left sm:block"><span className="block text-body font-medium text-primary">{user?.name || "User"}</span><span className="block text-small text-muted">{roleLabel(user)}</span></span>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
          {showUserMenu && (
            <div className="erp-overlay-panel absolute right-0 top-12 z-50 w-56 rounded-card border border-border bg-surface-raised shadow-overlay">
              <div className="border-b border-border px-4 py-3"><p className="text-body font-medium text-primary">{user?.name}</p><p className="text-small text-muted">{user?.email}</p></div>
              <div className="py-1">
                {canViewSettings && <button type="button" onClick={() => { setShowUserMenu(false); navigate("/settings/profile"); }} className="flex w-full items-center gap-3 px-4 py-2 text-left text-body text-secondary hover:bg-surface-muted hover:text-primary"><Settings className="h-4 w-4" /> Settings</button>}
                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 text-left text-body text-danger hover:bg-danger-soft"><LogOut className="h-4 w-4" /> Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

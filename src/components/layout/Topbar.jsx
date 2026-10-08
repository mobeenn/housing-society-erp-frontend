import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/authApi";
import { notificationsApi } from "@/features/notifications/notificationsApi";
import { globalSearch } from "@/features/search/searchApi";
import { roleLabel } from "@/lib/permissions";
import { useCan } from "@/hooks/useCan";
import CivicaLogo from "@/components/brand/CivicaLogo";
import TourLauncherButton from "@/tours/TourLauncherButton";
import useVisibilityRefetchInterval from "@/hooks/useVisibilityRefetchInterval";

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

const initials = (name) =>
  name?.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "?";

export default function Topbar({ onMenuClick, showMenuButton = false }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const canViewSettings = useCan("settings", "view");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
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
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        if (!search) setSearchOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [search]);

  const notificationPoll = useVisibilityRefetchInterval(90_000);
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list({ limit: 8 }),
    enabled: Boolean(user),
    refetchInterval: notificationPoll,
    refetchIntervalInBackground: false,
  });
  const searchResults = useQuery({
    queryKey: ["global-search", debouncedSearch],
    queryFn: () => globalSearch(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 30_000,
  });
  const notificationItems = notifications.data?.data || [];

  const openResult = (result) => {
    setSearch("");
    setDebouncedSearch("");
    setSearchOpen(false);
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
    try {
      await authApi.logout();
    } catch {
      /* log out locally even if the API is unavailable */
    }
    logout();
    queryClient.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="erp-gradient-header sticky top-0 z-30 flex h-14 min-h-11 items-center gap-2 rounded-shell px-3 shadow-overlay sm:h-16 sm:gap-3 sm:px-4 lg:px-6">
      {showMenuButton && (
        <button
          type="button"
          onClick={onMenuClick}
          className="shrink-0 rounded-lg p-2 text-white hover:bg-white/15 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div className="hidden shrink-0 md:block">
        <CivicaLogo variant="icon" height={36} className="drop-shadow-sm" />
      </div>

      <div ref={searchRef} className="relative min-w-0 flex-1 md:max-w-lg">
        <button
          type="button"
          className={`rounded-lg p-2 text-white hover:bg-white/15 md:hidden ${searchOpen ? "hidden" : ""}`}
          aria-label="Open search"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-5 w-5" />
        </button>
        <div className={`${searchOpen ? "block" : "hidden"} md:block`}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search members, plots, receipts..."
            className="min-h-11 w-full rounded-lg border border-white/25 bg-white/15 py-2 pl-10 pr-9 text-body text-white placeholder:text-white/70 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {(search || searchOpen) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchOpen(false);
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/80 hover:bg-white/15 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {debouncedSearch.length >= 2 && (
          <div className="erp-overlay-panel absolute left-0 right-0 top-12 z-50 max-h-80 overflow-y-auto rounded-card border border-slate-100 bg-white p-2 text-primary shadow-overlay sm:max-h-96">
            {searchResults.isFetching && <p className="px-3 py-4 text-body text-muted">Searching…</p>}
            {!searchResults.isFetching && searchResults.data?.groups?.length === 0 && (
              <p className="px-3 py-4 text-body text-muted">No results found.</p>
            )}
            {searchResults.data?.groups?.map((group) => (
              <div key={group.type} className="mb-2 last:mb-0">
                <p className="px-3 py-1.5 text-label font-semibold text-muted">{group.label}</p>
                {group.items.map((item) => (
                  <button
                    key={`${item.type}-${item._id}`}
                    onClick={() => openResult(item)}
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-body font-medium text-primary">{item.title}</span>
                      <span className="block truncate text-small text-muted">{item.subtitle}</span>
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 text-white sm:gap-2">
        <div className="hidden sm:block">
          <TourLauncherButton headerTone="light" />
        </div>
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((value) => !value)}
            className="relative min-h-11 min-w-11 rounded-lg p-2 text-white transition-colors duration-fast hover:bg-white/15"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifications.data?.unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-small font-bold text-accent">
                {notifications.data.unreadCount > 99 ? "99+" : notifications.data.unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="erp-overlay-panel absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-card border border-slate-100 bg-white text-primary shadow-overlay">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-body font-semibold text-primary">Notifications</p>
                <button
                  type="button"
                  onClick={async () => {
                    await notificationsApi.markAllRead();
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                  }}
                  className="text-small font-semibold text-accent hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notificationItems.length === 0 ? (
                  <p className="px-4 py-8 text-center text-body text-muted">No notifications yet.</p>
                ) : (
                  notificationItems.map((notification) => (
                    <button
                      key={notification._id}
                      onClick={() => openNotification(notification)}
                      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${!notification.isRead ? "bg-gold-soft/60" : ""}`}
                    >
                      <span className={`mt-1 h-2 w-2 rounded-full ${notification.isRead ? "bg-transparent" : "bg-accent"}`} />
                      <span className="min-w-0">
                        <span className="block text-body font-medium text-primary">{notification.title}</span>
                        <span className="mt-0.5 block line-clamp-2 text-small text-secondary">{notification.message}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu((value) => !value)}
            className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-fast hover:bg-white/15"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-small font-semibold text-white ring-1 ring-white/40">
              {initials(user?.name)}
            </span>
            <span className="hidden text-left md:block">
              <span className="block text-body font-medium text-white">{user?.name || "User"}</span>
              <span className="block text-small text-white/80">{roleLabel(user)}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-white/80 sm:block" />
          </button>
          {showUserMenu && (
            <div className="erp-overlay-panel absolute right-0 top-12 z-50 w-[min(14rem,calc(100vw-1.5rem))] rounded-card border border-slate-100 bg-white text-primary shadow-overlay">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-body font-medium text-primary">{user?.name}</p>
                <p className="truncate text-small text-muted">{user?.email}</p>
              </div>
              <div className="py-1">
                {canViewSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/settings/profile");
                    }}
                    className="flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-body text-secondary hover:bg-slate-50 hover:text-primary"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-body text-danger hover:bg-danger-soft"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

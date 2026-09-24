import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronDown, LogOut, Search, Settings, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
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
    try { await authApi.logout(); } catch { /* logout locally even if the API is unavailable */ }
    logout();
    queryClient.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6">
    <div ref={searchRef} className="relative w-full max-w-lg">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members, plots, receipts..." className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-9 text-sm placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
      {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:bg-neutral-100"><X className="h-3.5 w-3.5" /></button>}
      {debouncedSearch.length >= 2 && <div className="absolute left-0 right-0 top-12 z-50 max-h-96 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-xl">
        {searchResults.isFetching && <p className="px-3 py-4 text-sm text-neutral-400">Searching…</p>}
        {!searchResults.isFetching && searchResults.data?.groups?.length === 0 && <p className="px-3 py-4 text-sm text-neutral-400">No results found.</p>}
        {searchResults.data?.groups?.map((group) => <div key={group.type} className="mb-2 last:mb-0"><p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">{group.label}</p>{group.items.map((item) => <button key={`${item.type}-${item._id}`} onClick={() => openResult(item)} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-neutral-50"><span className="min-w-0"><span className="block truncate text-sm font-medium text-neutral-800">{item.title}</span><span className="block truncate text-xs text-neutral-400">{item.subtitle}</span></span><span className="text-xs text-neutral-300">→</span></button>)}</div>)}
      </div>}
    </div>

    <div className="flex shrink-0 items-center gap-3">
      <TourLauncherButton />
      <div ref={notificationRef} className="relative"><button onClick={() => setShowNotifications((value) => !value)} className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Notifications"><Bell className="h-5 w-5" />{notifications.data?.unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-bold text-white">{notifications.data.unreadCount > 99 ? "99+" : notifications.data.unreadCount}</span>}</button>
        {showNotifications && <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-neutral-200 bg-white shadow-xl"><div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3"><p className="text-sm font-semibold text-neutral-900">Notifications</p><button onClick={async () => { await notificationsApi.markAllRead(); queryClient.invalidateQueries({ queryKey: ["notifications"] }); }} className="text-xs text-primary-600 hover:underline">Mark all read</button></div><div className="max-h-80 overflow-y-auto">{notificationItems.length === 0 ? <p className="px-4 py-8 text-center text-sm text-neutral-400">No notifications yet.</p> : notificationItems.map((notification) => <button key={notification._id} onClick={() => openNotification(notification)} className={`flex w-full gap-3 border-b border-neutral-50 px-4 py-3 text-left hover:bg-neutral-50 ${!notification.isRead ? "bg-primary-50/40" : ""}`}><span className={`mt-1 h-2 w-2 rounded-full ${notification.isRead ? "bg-transparent" : "bg-primary-600"}`} /><span className="min-w-0"><span className="block text-sm font-medium text-neutral-800">{notification.title}</span><span className="mt-0.5 block line-clamp-2 text-xs text-neutral-500">{notification.message}</span></span></button>)}</div></div>}
      </div>

      <div ref={userMenuRef} className="relative"><button onClick={() => setShowUserMenu((value) => !value)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-100"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">{initials(user?.name)}</span><span className="hidden text-left sm:block"><span className="block text-sm font-medium text-neutral-700">{user?.name || "User"}</span><span className="block text-xs text-neutral-500">{roleLabel(user)}</span></span><ChevronDown className="h-4 w-4 text-neutral-400" /></button>
        {showUserMenu && <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-neutral-200 bg-white shadow-lg"><div className="border-b border-neutral-200 px-4 py-3"><p className="text-sm font-medium text-neutral-900">{user?.name}</p><p className="text-xs text-neutral-500">{user?.email}</p></div><div className="py-1">{canViewSettings && <button onClick={() => { setShowUserMenu(false); navigate("/settings/profile"); }} className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"><Settings className="h-4 w-4" /> Settings</button>}<button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50"><LogOut className="h-4 w-4" /> Logout</button></div></div>}
      </div>
    </div>
  </header>;
}

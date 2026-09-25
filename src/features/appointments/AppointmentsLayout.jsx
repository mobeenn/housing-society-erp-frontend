import { NavLink, Outlet } from "react-router-dom";
import { CalendarCheck2, History, UserRound } from "lucide-react";

export default function AppointmentsLayout() {
  return <div className="space-y-5" data-tour="appointments-page"><div><div className="flex items-center gap-2 text-body text-secondary"><UserRound className="h-4 w-4" /> Front Desk</div><h1 className="mt-1 text-h1 font-bold text-primary">Business Visitor Appointments</h1><p className="text-body text-secondary">A front-desk token queue for walk-in business visitors meeting staff.</p></div><div className="flex gap-2 border-b border-border" data-tour="appointments-nav"><NavLink to="/appointments/today" className={({ isActive }) => `flex items-center gap-2 border-b-2 px-4 py-3 text-body font-medium ${isActive ? "border-accent text-accent" : "border-transparent text-secondary"}`}><CalendarCheck2 className="h-4 w-4" /> Today</NavLink><NavLink to="/appointments/logs" className={({ isActive }) => `flex items-center gap-2 border-b-2 px-4 py-3 text-body font-medium ${isActive ? "border-accent text-accent" : "border-transparent text-secondary"}`}><History className="h-4 w-4" /> Logs</NavLink></div><Outlet /></div>;
}

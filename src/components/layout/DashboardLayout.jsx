import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";
import TourRunner from "@/tours/TourRunner";

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-primary">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((previous) => !previous)} />
      <div className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-base ${sidebarCollapsed ? "ml-16" : "ml-60"}`}>
        <Topbar />
        <main className="flex-1 px-6 py-5">
          <Breadcrumbs />
          <TourRunner />
          <div className="mt-4"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}

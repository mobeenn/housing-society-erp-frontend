import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";
import TourRunner from "@/tours/TourRunner";

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main content area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300
          ${sidebarCollapsed ? "ml-16" : "ml-60"}`}
      >
        <Topbar />

        <main className="flex-1 px-6 py-5">
          <Breadcrumbs />
          <TourRunner />
          <div className="mt-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

import { lazy, Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";
import AskAiDrawer from "@/components/ai/AskAiDrawer";

const TourRunner = lazy(() => import("@/tours/TourRunner"));

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? "4.5rem" : "15.5rem";

  return (
    <div className="min-h-screen bg-canvas p-4 text-primary">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((previous) => !previous)} />
      <div
        className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 transition-[margin] duration-base"
        style={{ marginLeft: `calc(${sidebarWidth} + 1rem)` }}
      >
        <Topbar />
        <main className="erp-shell-island flex flex-1 flex-col px-6 py-5">
          <Breadcrumbs />
          <Suspense fallback={null}>
            <TourRunner />
          </Suspense>
          <div className="mt-4 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
      <AskAiDrawer />
    </div>
  );
}

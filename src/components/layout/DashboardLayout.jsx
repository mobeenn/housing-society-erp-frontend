import { lazy, Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";
import AskAiDrawer from "@/components/ai/AskAiDrawer";
import useBreakpoint from "@/hooks/useBreakpoint";

const TourRunner = lazy(() => import("@/tours/TourRunner"));

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isDesktop } = useBreakpoint();
  const location = useLocation();
  const sidebarWidth = sidebarCollapsed ? "4.5rem" : "15.5rem";

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isDesktop) setMobileNavOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!mobileNavOpen || isDesktop) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileNavOpen, isDesktop]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas p-3 text-primary sm:p-4 lg:p-4">
      {!isDesktop && mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar
        collapsed={isDesktop ? sidebarCollapsed : false}
        mobileOpen={mobileNavOpen}
        isDesktop={isDesktop}
        onToggle={() => setSidebarCollapsed((previous) => !previous)}
        onNavigate={() => setMobileNavOpen(false)}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div
        className="flex min-h-[calc(100vh-1.5rem)] flex-col gap-3 transition-[margin] duration-base sm:min-h-[calc(100vh-2rem)] sm:gap-4"
        style={isDesktop ? { marginLeft: `calc(${sidebarWidth} + 1rem)` } : undefined}
      >
        <Topbar onMenuClick={() => setMobileNavOpen(true)} showMenuButton={!isDesktop} />
        <main className="erp-shell-island mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
          <Breadcrumbs />
          <Suspense fallback={null}>
            <TourRunner />
          </Suspense>
          <div className="mt-4 min-w-0 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
      <AskAiDrawer />
    </div>
  );
}

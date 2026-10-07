import { useEffect, useRef, useState } from "react";
import CivicaLogo from "@/components/brand/CivicaLogo";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/authApi";
import { getMyAccess } from "@/features/rbac/rbacApi";

/** Keep the Civica splash visible briefly even when auth resolves quickly. */
const MIN_SPLASH_MS = 1400;

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * Restores the session and effective module/action access from /api/rbac/my-access.
 * Cold start: refresh, then me + my-access in parallel.
 * After login: load access if not already loaded (without re-running refresh).
 *
 * Important: do not gate bootstrap with a permanent "done" ref — React StrictMode
 * remounts cancel the first run; a permanent gate would leave the spinner forever.
 */
export default function AuthInitializer({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const accessRequestRef = useRef(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessLoaded = useAuthStore((state) => state.accessLoaded);

  const loadAccess = async (cancelledRef) => {
    const store = useAuthStore.getState();
    if (store.accessLoaded) return;
    store.setAccessLoading(true);
    if (!accessRequestRef.current) {
      accessRequestRef.current = getMyAccess().finally(() => {
        accessRequestRef.current = null;
      });
    }
    try {
      const access = await accessRequestRef.current;
      if (!cancelledRef?.current) useAuthStore.getState().setAccess(access);
    } catch {
      if (!cancelledRef?.current) useAuthStore.getState().logout();
    }
  };

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    const finish = async () => {
      const elapsed = Date.now() - startedAt;
      const remaining = MIN_SPLASH_MS - elapsed;
      if (remaining > 0) await wait(remaining);
      if (!cancelled) setIsInitialized(true);
    };

    const initializeAuth = async () => {
      const store = useAuthStore.getState();

      if (store.isAuthenticated) {
        await loadAccess({ get current() { return cancelled; } });
        await finish();
        return;
      }

      try {
        const refreshData = await authApi.refresh();
        if (cancelled) return;
        const newAccessToken = refreshData.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        const [userData, access] = await Promise.all([authApi.me(), getMyAccess()]);
        if (cancelled) return;
        useAuthStore.getState().login(userData, newAccessToken);
        useAuthStore.getState().setAccess(access);
      } catch {
        // No refresh cookie / expired session → show login UI
        if (!cancelled) useAuthStore.getState().logout();
      } finally {
        await finish();
      }
    };

    initializeAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  // Post-login: fetch RBAC without re-running the refresh waterfall.
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || accessLoaded) return;
    const cancelled = { current: false };
    loadAccess(cancelled);
    return () => {
      cancelled.current = true;
    };
  }, [isInitialized, isAuthenticated, accessLoaded]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas">
        <CivicaLogo variant="logo" height={44} />
        <div className="erp-skeleton h-2 w-40 rounded-full" aria-label="Loading Civica" role="status" />
      </div>
    );
  }

  return children;
}

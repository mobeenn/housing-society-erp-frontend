import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/authApi";
import { getMyAccess } from "@/features/rbac/rbacApi";

/**
 * Restores the session and the effective module/action access returned by
 * /api/rbac/my-access. The access payload is fetched after login/refresh and
 * shared by the StrictMode bootstrap effect so it is requested only once.
 */
export default function AuthInitializer({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const accessRequestRef = useRef(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessLoaded = useAuthStore((state) => state.accessLoaded);

  useEffect(() => {
    let cancelled = false;

    const loadAccess = async () => {
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
        if (!cancelled) useAuthStore.getState().setAccess(access);
      } catch {
        if (!cancelled) useAuthStore.getState().logout();
      }
    };

    const initializeAuth = async () => {
      const store = useAuthStore.getState();

      if (store.isAuthenticated) {
        await loadAccess();
        if (!cancelled) setIsInitialized(true);
        return;
      }

      try {
        const refreshData = await authApi.refresh();
        const newAccessToken = refreshData.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        const userData = await authApi.me();
        useAuthStore.getState().login(userData, newAccessToken);
        await loadAccess();
      } catch {
        if (!cancelled) useAuthStore.getState().logout();
      } finally {
        if (!cancelled) setIsInitialized(true);
      }
    };

    initializeAuth();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessLoaded]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600" />
      </div>
    );
  }

  return children;
}

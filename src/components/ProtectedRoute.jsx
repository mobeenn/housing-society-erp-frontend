import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCan, useIsSuperAdmin } from "@/hooks/useCan";

function resolveRequirement(requiredModule, requiredAction) {
  if (!requiredModule) return null;
  return { module: requiredModule, action: requiredAction || "view" };
}

function AccessLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600" />
    </div>
  );
}

/**
 * Authenticated route wrapper. Effective access is supplied by the backend
 * registry through requiredModule/requiredAction.
 */
export default function ProtectedRoute({
  children,
  requiredModule,
  requiredAction = "view",
  requiredSuperAdmin = false,
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const accessLoaded = useAuthStore((state) => state.accessLoaded);
  const requirement = resolveRequirement(requiredModule, requiredAction);
  const canAccess = useCan(requirement?.module || "", requirement?.action || "view");
  const isSuperAdmin = useIsSuperAdmin();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!accessLoaded) return <AccessLoading />;

  const allowed = requiredSuperAdmin ? isSuperAdmin : !requirement || canAccess;
  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="rounded-xl border border-neutral-200 bg-white px-8 py-12 text-center shadow-sm">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Access Denied</h1>
          <p className="text-sm text-neutral-500">You don't have permission to access this page.</p>
          {requirement && (
            <p className="mt-1 text-xs text-neutral-400">
              Required access: <code className="rounded bg-neutral-100 px-2 py-0.5">{requirement.module}:{requirement.action}</code>
            </p>
          )}
        </div>
      </div>
    );
  }

  return children;
}

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
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
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
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="rounded-card border border-border bg-surface px-8 py-12 text-center shadow-none">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-h1 font-semibold text-primary">Access Denied</h1>
          <p className="text-body text-secondary">You don't have permission to access this page.</p>
          {requirement && (
            <p className="mt-1 text-small text-muted">
              Required access: <code className="rounded-control bg-surface-muted px-2 py-0.5">{requirement.module}:{requirement.action}</code>
            </p>
          )}
        </div>
      </div>
    );
  }

  return children;
}

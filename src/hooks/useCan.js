import { useAuthStore } from "@/store/authStore";

/**
 * Return the server-resolved effective access for a module/action pair.
 * The backend remains the security boundary; this hook only controls UI
 * visibility and button rendering.
 */
export function useCan(moduleKey, action = "view") {
  const access = useAuthStore((state) => state.access);
  const module = access?.modules?.find((item) => item.key === moduleKey);
  return Boolean(module?.isActive && module?.isVisible && module?.actions?.[action] === true);
}

export function useIsSuperAdmin() {
  return useAuthStore((state) => Boolean(state.access?.isSuperAdmin));
}

export function useRbacAccess() {
  return useAuthStore((state) => state.access);
}

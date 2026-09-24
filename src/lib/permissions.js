// Display/dashboard helpers only. Authorization is resolved by the backend
// RBAC registry and consumed through useCan(); do not add permission checks
// based on role permissions here.
export function primaryRoleName(user) {
  return user?.roles?.find((role) => typeof role === "object")?.name || user?.role?.name || "Society Admin";
}

export function roleLabel(user) {
  return primaryRoleName(user);
}

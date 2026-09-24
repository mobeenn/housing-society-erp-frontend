import apiClient from "@/lib/apiClient";

export const getMyAccess = async () => {
  const response = await apiClient.get("/rbac/my-access");
  return response.data.data;
};

export const getRoleAccess = async (roleId) => {
  const response = await apiClient.get(`/rbac/roles/${roleId}/access`);
  return response.data.data;
};

export const updateRoleAccess = async (roleId, modules) => {
  const response = await apiClient.put(`/rbac/roles/${roleId}/access`, { modules });
  return response.data.data;
};

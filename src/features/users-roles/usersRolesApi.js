import apiClient from "../../lib/apiClient";

// ==================== Users ====================

export const getUsers = async (params = {}) => {
  const response = await apiClient.get("/users", { params });
  return response.data.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (userData) => {
  const response = await apiClient.post("/users", userData);
  return response.data.data;
};

export const updateUser = async (id, userData) => {
  const response = await apiClient.patch(`/users/${id}`, userData);
  return response.data.data;
};

export const toggleUserActive = async (id) => {
  const response = await apiClient.patch(`/users/${id}/toggle-active`);
  return response.data.data;
};

export const triggerPasswordReset = async (id) => {
  const response = await apiClient.post(`/users/${id}/reset-password`);
  return response.data.data;
};

// ==================== Roles ====================

export const getRoles = async (params = {}) => {
  const response = await apiClient.get("/roles", { params });
  return response.data.data;
};

export const getRoleById = async (id) => {
  const response = await apiClient.get(`/roles/${id}`);
  return response.data.data;
};

export const createRole = async (roleData) => {
  const response = await apiClient.post("/roles", roleData);
  return response.data.data;
};

export const updateRole = async (id, roleData) => {
  const response = await apiClient.put(`/roles/${id}`, roleData);
  return response.data.data;
};

export const deleteRole = async (id) => {
  const response = await apiClient.delete(`/roles/${id}`);
  return response.data.data;
};

// ==================== Permissions ====================

export const getPermissionsCatalog = async () => {
  const response = await apiClient.get("/permissions/catalog");
  return response.data.data;
};

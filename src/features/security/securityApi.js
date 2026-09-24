import apiClient from "@/lib/apiClient";

// ==================== Guards ====================

export const getGuards = async (params = {}) => {
  const response = await apiClient.get("/security/guards", { params });
  return response.data.data;
};

export const getGuardById = async (id) => {
  const response = await apiClient.get(`/security/guards/${id}`);
  return response.data.data;
};

export const createGuard = async (data) => {
  const response = await apiClient.post("/security/guards", data);
  return response.data.data;
};

export const updateGuard = async (id, data) => {
  const response = await apiClient.patch(`/security/guards/${id}`, data);
  return response.data.data;
};

// ==================== Duty Roster ====================

export const getRoster = async (params = {}) => {
  const response = await apiClient.get("/security/roster", { params });
  return response.data.data;
};

export const assignRoster = async (data) => {
  const response = await apiClient.post("/security/roster/assign", data);
  return response.data.data;
};

export const markAttendance = async (data) => {
  const response = await apiClient.post("/security/roster/attendance", data);
  return response.data.data;
};

// ==================== Vehicles ====================

export const getVehicles = async (params = {}) => {
  const response = await apiClient.get("/vehicles", { params });
  return response.data.data;
};

export const getVehicleById = async (id) => {
  const response = await apiClient.get(`/vehicles/${id}`);
  return response.data.data;
};

export const createVehicle = async (data) => {
  const response = await apiClient.post("/vehicles", data);
  return response.data.data;
};

export const updateVehicle = async (id, data) => {
  const response = await apiClient.patch(`/vehicles/${id}`, data);
  return response.data.data;
};

export const deleteVehicle = async (id) => {
  const response = await apiClient.delete(`/vehicles/${id}`);
  return response.data.data;
};

export const issueSticker = async (id, stickerNumber) => {
  const response = await apiClient.post(`/vehicles/${id}/sticker`, { stickerNumber });
  return response.data.data;
};

export const updateVehicleStatus = async (id, status) => {
  const response = await apiClient.patch(`/vehicles/${id}/status`, { status });
  return response.data.data;
};

import api from "@/lib/apiClient";

const unwrapListResponse = (response) => response.data?.data ?? response.data;

// ==================== Visitor Entries ====================

export const listVisitorEntries = async (params = {}) => {
  const response = await api.get("/visitors/entries", { params });
  return unwrapListResponse(response);
};

export const getVisitorEntry = async (id) => {
  const response = await api.get(`/visitors/entries/${id}`);
  return response.data;
};

export const createVisitorEntry = async (data) => {
  const response = await api.post("/visitors/entries", data);
  return response.data;
};

export const markExit = async (id, data) => {
  const response = await api.post(`/visitors/entries/${id}/exit`, data);
  return response.data;
};

// ==================== Passes ====================

export const listPasses = async (params = {}) => {
  const response = await api.get("/visitors/passes", { params });
  return unwrapListResponse(response);
};

export const getPass = async (id) => {
  const response = await api.get(`/visitors/passes/${id}`);
  return response.data;
};

export const createPass = async (data) => {
  const response = await api.post("/visitors/passes", data);
  return response.data;
};

export const updatePass = async (id, data) => {
  const response = await api.patch(`/visitors/passes/${id}`, data);
  return response.data;
};

export const deletePass = async (id) => {
  const response = await api.delete(`/visitors/passes/${id}`);
  return response.data;
};

// ==================== Blacklist ====================

export const listBlacklist = async (params = {}) => {
  const response = await api.get("/visitors/blacklist", { params });
  return unwrapListResponse(response);
};

export const getBlacklistEntry = async (id) => {
  const response = await api.get(`/visitors/blacklist/${id}`);
  return response.data;
};

export const createBlacklistEntry = async (data) => {
  const response = await api.post("/visitors/blacklist", data);
  return response.data;
};

export const updateBlacklistEntry = async (id, data) => {
  const response = await api.patch(`/visitors/blacklist/${id}`, data);
  return response.data;
};

export const deleteBlacklistEntry = async (id) => {
  const response = await api.delete(`/visitors/blacklist/${id}`);
  return response.data;
};

// ==================== Security Reports ====================

export const getActivityReport = async (params = {}) => {
  const response = await api.get("/visitors/reports/activity", { params });
  return response.data;
};

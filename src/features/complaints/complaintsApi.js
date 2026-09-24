import apiClient from "@/lib/apiClient";

export const getComplaints = async (params) =>
  (await apiClient.get("/complaints", { params })).data.data;

export const getComplaint = async (id) =>
  (await apiClient.get(`/complaints/${id}`)).data.data;

export const createComplaint = async (data) =>
  (await apiClient.post("/complaints", data)).data.data;

export const assignComplaint = async (id, data) =>
  (await apiClient.post(`/complaints/${id}/assign`, data)).data.data;

export const addComplaintComment = async (id, text) =>
  (await apiClient.post(`/complaints/${id}/comments`, { text })).data.data;

export const changeComplaintStatus = async (id, status) =>
  (await apiClient.post(`/complaints/${id}/status`, { status })).data.data;

export const resolveComplaint = async (id, resolutionNote) =>
  (await apiClient.post(`/complaints/${id}/resolve`, { resolutionNote })).data.data;

export const reopenComplaint = async (id) =>
  (await apiClient.post(`/complaints/${id}/reopen`)).data.data;

export const getComplaintsReport = async (params) =>
  (await apiClient.get("/reports/complaints", { params })).data.data;
import apiClient from "@/lib/apiClient";

// ── Assets ──────────────────────────────────────────────
export const getAssets = async (params) =>
  (await apiClient.get("/assets", { params })).data.data;

export const getAsset = async (id) =>
  (await apiClient.get(`/assets/${id}`)).data.data;

export const createAsset = async (data) =>
  (await apiClient.post("/assets", data)).data.data;

export const updateAsset = async (id, data) =>
  (await apiClient.put(`/assets/${id}`, data)).data.data;

/** Full maintenance history for an asset (SRS Section 17). */
export const getAssetHistory = async (id) =>
  (await apiClient.get(`/assets/${id}/history`)).data.data;

// ── Work orders ────────────────────────────────────────
export const getWorkOrders = async (params) =>
  (await apiClient.get("/work-orders", { params })).data.data;

export const getWorkOrder = async (id) =>
  (await apiClient.get(`/work-orders/${id}`)).data.data;

export const createWorkOrder = async (data) =>
  (await apiClient.post("/work-orders", data)).data.data;

export const updateWorkOrder = async (id, data) =>
  (await apiClient.put(`/work-orders/${id}`, data)).data.data;

export const logWorkOrderProgress = async (id, note) =>
  (await apiClient.post(`/work-orders/${id}/progress`, { note })).data.data;

export const changeWorkOrderStatus = async (id, status) =>
  (await apiClient.post(`/work-orders/${id}/status`, { status })).data.data;

export const completeWorkOrder = async (id, completionNote) =>
  (await apiClient.post(`/work-orders/${id}/complete`, { completionNote }))
    .data.data;

export const cancelWorkOrder = async (id, reason) =>
  (await apiClient.post(`/work-orders/${id}/cancel`, { reason })).data.data;
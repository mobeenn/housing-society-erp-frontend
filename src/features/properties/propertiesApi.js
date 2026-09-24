import apiClient from "@/lib/apiClient";

export const PLOT_STATUSES = [
  "Available",
  "Reserved",
  "Booked",
  "Allotted",
  "Sold",
  "Transferred",
  "Cancelled",
  "Possessed",
  "Under Construction",
  "Constructed",
  "Merged",
  "BoughtBack",
];

export const getPlots = async (params) => {
  const { data } = await apiClient.get("/plots", { params });
  return data.data;
};

export const getPlotById = async (id) => {
  const { data } = await apiClient.get(`/plots/${id}`);
  return data.data;
};

export const getPlotHistory = async (id) => {
  const { data } = await apiClient.get(`/plots/${id}/history`);
  return data.data;
};

export const createPlot = async (plot) => {
  const { data } = await apiClient.post("/plots", plot);
  return data.data;
};

export const updatePlot = async (id, plot) => {
  const { data } = await apiClient.put(`/plots/${id}`, plot);
  return data.data;
};

export const deletePlot = async (id) => {
  const { data } = await apiClient.delete(`/plots/${id}`);
  return data.data;
};
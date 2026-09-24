import apiClient from "@/lib/apiClient";

export const listPlotMerges = async (params = {}) => {
  const response = await apiClient.get("/plot-merge", { params });
  return response.data.data;
};

export const getEligiblePlots = async () => {
  const response = await apiClient.get("/plot-merge/eligible-plots");
  return response.data.data;
};

export const getPlotMerge = async (id) => {
  const response = await apiClient.get(`/plot-merge/${id}`);
  return response.data.data;
};

export const executePlotMerge = async (data) => {
  const response = await apiClient.post("/plot-merge/execute", data);
  return response.data.data;
};

import apiClient from "@/lib/apiClient";

export const listRegistryPlotOptions = async (params = {}) => {
  const response = await apiClient.get("/registry/plot-options", { params });
  return response.data.data;
};

export const listRegistryBatches = async (params = {}) => {
  const response = await apiClient.get("/registry/batches", { params });
  return response.data.data;
};

export const getRegistryBatch = async (id) => {
  const response = await apiClient.get(`/registry/batches/${id}`);
  return response.data.data;
};

export const createRegistryBatch = async (data) => {
  const response = await apiClient.post("/registry/batches", data);
  return response.data.data;
};

export const completeRegistryBatch = async (id, data = {}) => {
  const response = await apiClient.post(`/registry/batches/${id}/complete`, data);
  return response.data.data;
};

import apiClient from "@/lib/apiClient";

export const noticesApi = {
  list: async () => (await apiClient.get("/notices")).data.data,
  create: async (data) => (await apiClient.post("/notices", data)).data.data,
  update: async (id, data) => (await apiClient.patch(`/notices/${id}`, data)).data.data,
  publish: async (id) => (await apiClient.post(`/notices/${id}/publish`)).data.data,
  remove: async (id) => (await apiClient.delete(`/notices/${id}`)).data,
};

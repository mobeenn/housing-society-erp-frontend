import apiClient from "@/lib/apiClient";

export const globalSearch = async (q) =>
  (await apiClient.get("/search", { params: { q } })).data.data;

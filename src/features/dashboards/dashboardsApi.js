import apiClient from "@/lib/apiClient";

export const getRoleDashboard = async (type) =>
  (await apiClient.get(`/dashboards/${type}`)).data.data;

import apiClient from "@/lib/apiClient";

export const notificationsApi = {
  list: async (params = {}) => (await apiClient.get("/notifications", { params })).data.data,
  markRead: async (id) => (await apiClient.patch(`/notifications/${id}/read`)).data.data,
  markAllRead: async () => (await apiClient.patch("/notifications/read-all")).data,
};

import apiClient from "@/lib/apiClient";

export const listBuybacks = async (params = {}) => {
  const response = await apiClient.get("/buyback", { params });
  return response.data.data;
};

export const getEligibleBookings = async () => {
  const response = await apiClient.get("/buyback/eligible-bookings");
  return response.data.data;
};

export const getBuyback = async (id) => {
  const response = await apiClient.get(`/buyback/${id}`);
  return response.data.data;
};

export const executeBuyback = async (data) => {
  const response = await apiClient.post("/buyback/execute", data);
  return response.data.data;
};

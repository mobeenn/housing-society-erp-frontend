import apiClient from "@/lib/apiClient";

export const BOOKING_STATUSES = ["Pending Approval", "Confirmed", "Cancelled"];

export const getBookings = async (params) => {
  const { data } = await apiClient.get("/bookings", { params });
  return data.data;
};

export const getBookingById = async (id) => {
  const { data } = await apiClient.get(`/bookings/${id}`);
  return data.data;
};

export const createBooking = async (booking) => {
  const { data } = await apiClient.post("/bookings", booking);
  return data.data;
};

export const approveBooking = async (id, planTemplate) => {
  const { data } = await apiClient.post(`/bookings/${id}/approve`, { planTemplate });
  return data.data;
};

export const rejectBooking = async (id, reason) => {
  const { data } = await apiClient.post(`/bookings/${id}/reject`, { reason });
  return data.data;
};

export const cancelBooking = async (id, reason, refundAmount) => {
  const { data } = await apiClient.post(`/bookings/${id}/cancel`, { reason, refundAmount });
  return data.data;
};
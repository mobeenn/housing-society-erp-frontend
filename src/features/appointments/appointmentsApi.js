import apiClient from "@/lib/apiClient";

export const listAppointments = async (params = {}) => {
  const response = await apiClient.get("/appointments", { params });
  return response.data.data;
};

export const getTodaysAppointments = async () => {
  const response = await apiClient.get("/appointments/today");
  return response.data.data;
};

export const listAppointmentHosts = async () => {
  const response = await apiClient.get("/appointments/hosts");
  return response.data.data;
};

export const createAppointment = async (data) => {
  const response = await apiClient.post("/appointments", data);
  return response.data.data;
};

export const checkInAppointment = async (id) => {
  const response = await apiClient.post(`/appointments/${id}/check-in`);
  return response.data.data;
};

export const checkOutAppointment = async (id) => {
  const response = await apiClient.post(`/appointments/${id}/check-out`);
  return response.data.data;
};

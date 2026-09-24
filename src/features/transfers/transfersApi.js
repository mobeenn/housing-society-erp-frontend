import apiClient from "@/lib/apiClient";
export const getTransfers = async (params) => (await apiClient.get("/transfers", { params })).data.data;
export const getTransfer = async (id) => (await apiClient.get(`/transfers/${id}`)).data.data;
export const createTransfer = async (data) => (await apiClient.post("/transfers", data)).data.data;
export const verifyTransfer = async (id) => (await apiClient.post(`/transfers/${id}/verify`)).data.data;
export const approveTransfer = async (id) => (await apiClient.post(`/transfers/${id}/approve`)).data.data;
export const rejectTransfer = async (id, remarks) => (await apiClient.post(`/transfers/${id}/reject`, { remarks })).data.data;
export const completeTransfer = async (id) => (await apiClient.post(`/transfers/${id}/complete`)).data.data;
export const downloadCertificate = async (id) => (await apiClient.get(`/transfers/${id}/certificate.pdf`, { responseType: "blob" })).data;
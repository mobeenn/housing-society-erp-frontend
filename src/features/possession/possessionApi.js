import apiClient from "@/lib/apiClient";
export const getPossessions = async (params) => (await apiClient.get("/possession", { params })).data.data;
export const getPossession = async (id) => (await apiClient.get(`/possession/${id}`)).data.data;
export const createPossession = async (data) => (await apiClient.post("/possession", data)).data.data;
export const verifyPossession = async (id) => (await apiClient.post(`/possession/${id}/verify`)).data.data;
export const payPossessionCharges = async (id) => (await apiClient.post(`/possession/${id}/pay-charges`)).data.data;
export const approvePossession = async (id) => (await apiClient.post(`/possession/${id}/approve`)).data.data;
export const issuePossession = async (id) => (await apiClient.post(`/possession/${id}/issue`)).data.data;
export const downloadPossessionLetter = async (id) => (await apiClient.get(`/possession/${id}/letter.pdf`, { responseType: "blob" })).data;
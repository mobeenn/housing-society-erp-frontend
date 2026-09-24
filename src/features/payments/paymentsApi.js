import apiClient from "@/lib/apiClient";

export const PAYMENT_METHODS = ["Cash", "Cheque", "BankTransfer", "Online"];
export const getPayments = async (params) => (await apiClient.get("/payments", { params })).data.data;
export const previewPayment = async (data) => (await apiClient.post("/payments/preview", data)).data.data;
export const createPayment = async (data) => (await apiClient.post("/payments", data)).data.data;
export const downloadReceipt = async (id) => (await apiClient.get(`/payments/${id}/receipt.pdf`, { responseType: "blob" })).data;
export const getMemberStatement = async (id) => (await apiClient.get(`/members/${id}/statement`)).data.data;
export const getRefunds = async () => (await apiClient.get("/refunds")).data.data;
export const approveRefund = async (id) => (await apiClient.post(`/refunds/${id}/approve`)).data.data;
export const rejectRefund = async (id) => (await apiClient.post(`/refunds/${id}/reject`)).data.data;
export const payRefund = async (id) => (await apiClient.post(`/refunds/${id}/pay`)).data.data;
import apiClient from "@/lib/apiClient";
export const getExpenses = async (params) => (await apiClient.get("/expenses", { params })).data.data;
export const createExpense = async (data) => (await apiClient.post("/expenses", data)).data.data;
export const approveExpense = async (id) => (await apiClient.post(`/expenses/${id}/approve`)).data.data;
export const rejectExpense = async (id) => (await apiClient.post(`/expenses/${id}/reject`)).data.data;
export const payExpense = async (id) => (await apiClient.post(`/expenses/${id}/pay`)).data.data;
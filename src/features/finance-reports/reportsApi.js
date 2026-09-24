import apiClient from "@/lib/apiClient";

export const REPORT_TYPES = [
  { value: "collection", label: "Collection" },
  { value: "dues", label: "Dues" },
  { value: "defaulters", label: "Defaulters" },
  { value: "income-expense", label: "Income vs Expense" },
  { value: "refunds", label: "Refunds" },
];

export const getReportCatalog = async () =>
  (await apiClient.get("/reports/catalog")).data.data;

export const getDashboard = async () =>
  (await apiClient.get("/reports/dashboard")).data.data;

export const getReport = async (type, params) => (await apiClient.get(`/reports/${type}`, { params })).data.data;
export const exportReport = async (type, params) => (await apiClient.get(`/reports/${type}`, { params, responseType: "blob" })).data;
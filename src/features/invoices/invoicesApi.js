import apiClient from "@/lib/apiClient";

export const listInvoices = async (params = {}) => {
  const response = await apiClient.get("/invoices", { params });
  return response.data.data;
};

export const getInvoice = async (id) => {
  const response = await apiClient.get(`/invoices/${id}`);
  return response.data.data;
};

export const cancelInvoice = async (id) => {
  const response = await apiClient.delete(`/invoices/${id}`);
  return response.data.data;
};

export const openInvoiceFile = async (fileUrl) => {
  if (!fileUrl) return false;
  if (/^https?:\/\//i.test(fileUrl)) {
    const anchor = document.createElement("a");
    anchor.href = fileUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    return true;
  }
  const apiPath = fileUrl.startsWith("/api/") ? fileUrl.slice(4) : fileUrl;
  const response = await apiClient.get(apiPath, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
};

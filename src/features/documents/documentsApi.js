import apiClient from "@/lib/apiClient";

export const listDocuments = async (relatedEntityType, relatedEntityId) => {
  const { data } = await apiClient.get("/documents", {
    params: { relatedEntityType, relatedEntityId },
  });
  return data.data;
};

export const uploadDocument = async ({ file, relatedEntityType, relatedEntityId, type, number, issueDate, expiryDate }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("relatedEntityType", relatedEntityType);
  formData.append("relatedEntityId", relatedEntityId);
  formData.append("type", type);
  if (number) formData.append("number", number);
  if (issueDate) formData.append("issueDate", issueDate);
  if (expiryDate) formData.append("expiryDate", expiryDate);
  const { data } = await apiClient.post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return data.data;
};

export const downloadDocument = async (id) => {
  const response = await apiClient.get(`/documents/${id}/download`, { responseType: "blob" });
  return response.data;
};

export const verifyDocument = async (id, verificationStatus) => {
  const { data } = await apiClient.patch(`/documents/${id}/verify`, { verificationStatus });
  return data.data;
};
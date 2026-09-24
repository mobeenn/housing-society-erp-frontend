import apiClient from "@/lib/apiClient";

/**
 * Administration API
 */
export const administrationApi = {
  // Society Settings
  getSocietySettings: async () => {
    const { data } = await apiClient.get("/administration/settings");
    return data.data;
  },

  updateSocietySettings: async (settings) => {
    const { data } = await apiClient.put("/administration/settings", settings);
    return data.data;
  },

  // Numbering Rules
  getNumberingRules: async () => {
    const { data } = await apiClient.get("/administration/numbering-rules");
    return data.data;
  },

  updateNumberingRule: async (id, rule) => {
    const { data } = await apiClient.put(`/administration/numbering-rules/${id}`, rule);
    return data.data;
  },

  // Master Data
  getMasterData: async (type, includeArchived = false) => {
    const { data } = await apiClient.get(`/administration/master-data/${type}`, {
      params: { includeArchived },
    });
    return data.data;
  },

  createMasterData: async (type, item) => {
    const { data } = await apiClient.post(`/administration/master-data/${type}`, item);
    return data.data;
  },

  updateMasterData: async (type, id, item) => {
    const { data } = await apiClient.put(`/administration/master-data/${type}/${id}`, item);
    return data.data;
  },

  archiveMasterData: async (type, id) => {
    const { data } = await apiClient.patch(`/administration/master-data/${type}/${id}/archive`);
    return data.data;
  },

  restoreMasterData: async (type, id) => {
    const { data } = await apiClient.patch(`/administration/master-data/${type}/${id}/restore`);
    return data.data;
  },

  // Audit Logs
  getAuditLogs: async (params) => {
    const { data } = await apiClient.get("/administration/audit-logs", { params });
    return data.data;
  },
};

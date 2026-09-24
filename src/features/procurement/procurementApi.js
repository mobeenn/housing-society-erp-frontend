import api from "@/lib/apiClient";

// ========== Vendor API ==========
export const vendorApi = {
  list: async (params = {}) => {
    const response = await api.get('/procurement/vendors', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/procurement/vendors/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/procurement/vendors', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/procurement/vendors/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/procurement/vendors/${id}`);
    return response.data;
  },

  getPurchaseHistory: async (id) => {
    const response = await api.get(`/procurement/vendors/${id}/purchase-history`);
    return response.data;
  },
};

// ========== Purchase Request API ==========
export const purchaseRequestApi = {
  list: async (params = {}) => {
    const response = await api.get('/procurement/purchase-requests', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/procurement/purchase-requests/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/procurement/purchase-requests', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/procurement/purchase-requests/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/procurement/purchase-requests/${id}`);
    return response.data;
  },
};

// ========== Quotation API ==========
export const quotationApi = {
  list: async (params = {}) => {
    const response = await api.get('/procurement/quotations', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/procurement/quotations/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/procurement/quotations', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/procurement/quotations/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/procurement/quotations/${id}`);
    return response.data;
  },
};

// ========== Purchase Order API ==========
export const purchaseOrderApi = {
  list: async (params = {}) => {
    const response = await api.get('/procurement/purchase-orders', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/procurement/purchase-orders/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/procurement/purchase-orders', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/procurement/purchase-orders/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/procurement/purchase-orders/${id}`);
    return response.data;
  },
};

// ========== GRN API ==========
export const grnApi = {
  list: async (params = {}) => {
    const response = await api.get('/procurement/grns', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/procurement/grns/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/procurement/grns', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/procurement/grns/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/procurement/grns/${id}`);
    return response.data;
  },
};

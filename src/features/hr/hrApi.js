import api from "@/lib/apiClient";

// ══════════════════════════════════════════════════
// Employee API
// ══════════════════════════════════════════════════

export const employeeApi = {
  list: async (params = {}) => {
    const response = await api.get('/hr/employees', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hr/employees/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/hr/employees', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/hr/employees/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/hr/employees/${id}`);
    return response.data;
  },

  getLeaveBalance: async (employeeId) => {
    const response = await api.get(`/hr/employees/${employeeId}/leave-balance`);
    return response.data;
  },
};

// ══════════════════════════════════════════════════
// Attendance API
// ══════════════════════════════════════════════════

export const attendanceApi = {
  list: async (params = {}) => {
    const response = await api.get('/hr/attendance', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hr/attendance/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/hr/attendance', data);
    return response.data;
  },

  bulkCreate: async (records) => {
    const response = await api.post('/hr/attendance/bulk', { records });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/hr/attendance/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/hr/attendance/${id}`);
    return response.data;
  },
};

// ══════════════════════════════════════════════════
// Leave Request API
// ══════════════════════════════════════════════════

export const leaveRequestApi = {
  list: async (params = {}) => {
    const response = await api.get('/hr/leave-requests', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hr/leave-requests/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/hr/leave-requests', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/hr/leave-requests/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/hr/leave-requests/${id}`);
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════════════
// HR Payroll API (additive; existing HR APIs above remain unchanged)
// ═══════════════════════════════════════════════════════════════════

export const payrollApi = {
  getSetup: async () => {
    const response = await api.get('/hr-payroll/setup');
    return response.data.data;
  },

  updateSetup: async (data) => {
    const response = await api.put('/hr-payroll/setup', data);
    return response.data.data;
  },

  listEmployees: async () => {
    const response = await api.get('/hr-payroll/employees');
    return response.data.data;
  },

  assignSalaryStructure: async (employeeId, salaryStructure) => {
    const response = await api.put(`/hr-payroll/employees/${employeeId}/salary-structure`, { salaryStructure });
    return response.data.data;
  },

  listLoans: async (params = {}) => {
    const response = await api.get('/hr-payroll/loans', { params });
    return response.data.data;
  },

  createLoan: async (data) => {
    const response = await api.post('/hr-payroll/loans', data);
    return response.data.data;
  },

  closeLoan: async (id) => {
    const response = await api.post(`/hr-payroll/loans/${id}/close`);
    return response.data.data;
  },

  listRuns: async (params = {}) => {
    const response = await api.get('/hr-payroll/payroll-runs', { params });
    return response.data.data;
  },

  generateDraft: async (data) => {
    const response = await api.post('/hr-payroll/payroll-runs/generate', data);
    return response.data.data;
  },

  getRun: async (id) => {
    const response = await api.get(`/hr-payroll/payroll-runs/${id}`);
    return response.data.data;
  },

  approve: async (id) => {
    const response = await api.post(`/hr-payroll/payroll-runs/${id}/approve`);
    return response.data.data;
  },

  markPaid: async (id) => {
    const response = await api.post(`/hr-payroll/payroll-runs/${id}/pay`);
    return response.data.data;
  },

  exportRegister: async (id) => {
    const response = await api.get(`/hr-payroll/payroll-runs/${id}/register.csv`, { responseType: 'blob' });
    return response.data;
  },

  exportPayslips: async (id) => {
    const response = await api.get(`/hr-payroll/payroll-runs/${id}/payslips.csv`, { responseType: 'blob' });
    return response.data;
  },
};

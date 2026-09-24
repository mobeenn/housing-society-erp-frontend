import axios from "../../lib/apiClient";

/**
 * Members API Service
 */

// Get all members with search and pagination
export const getMembers = async ({ page = 1, limit = 20, search = "", status = "" }) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (status) params.append("status", status);

  const response = await axios.get(`/members?${params.toString()}`);
  return response.data.data;
};

export const listMembers = getMembers;

// Get a single member by ID
export const getMemberById = async (id) => {
  const response = await axios.get(`/members/${id}`);
  return response.data.data;
};

// Get member 360 view
export const getMember360 = async (id) => {
  const response = await axios.get(`/members/${id}/360`);
  return response.data.data;
};

// Check for duplicate members
export const checkDuplicates = async ({ cnic, phone, excludeId = null }) => {
  const response = await axios.post("/members/check-duplicate", {
    cnic,
    phone,
    excludeId,
  });
  return response.data.data;
};

// Create a new member
export const createMember = async (data) => {
  const response = await axios.post("/members", data);
  return response.data.data;
};

// Update a member
export const updateMember = async (id, data) => {
  const response = await axios.put(`/members/${id}`, data);
  return response.data.data;
};

// Update member status
export const updateMemberStatus = async (id, status) => {
  const response = await axios.patch(`/members/${id}/status`, { status });
  return response.data.data;
};

// Delete a member
export const deleteMember = async (id) => {
  const response = await axios.delete(`/members/${id}`);
  return response.data.data;
};

// Get member statistics
export const getStatistics = async () => {
  const response = await axios.get("/members/stats");
  return response.data.data;
};

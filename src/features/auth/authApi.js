import apiClient from "@/lib/apiClient";

/**
 * Auth API service
 * Handles all authentication-related API calls
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials) => {
    const { data } = await apiClient.post("/auth/login", credentials);
    return data.data;
  },

  /**
   * Logout current user
   */
  logout: async () => {
    const { data } = await apiClient.post("/auth/logout");
    return data;
  },

  /**
   * Get current authenticated user profile
   */
  me: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data.data;
  },

  /**
   * Refresh access token
   */
  refresh: async () => {
    const { data } = await apiClient.post("/auth/refresh");
    return data.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwords) => {
    const { data } = await apiClient.post("/auth/change-password", passwords);
    return data;
  },
};

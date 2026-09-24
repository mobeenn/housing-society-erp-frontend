import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  access: { modules: [], isSuperAdmin: false },
  accessLoaded: false,
  accessLoading: false,

  setAccessToken: (token) => set({ accessToken: token }),

  login: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      accessLoaded: false,
      accessLoading: false,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      access: { modules: [], isSuperAdmin: false },
      accessLoaded: false,
      accessLoading: false,
    }),

  setAccess: (access) =>
    set({
      access: access || { modules: [], isSuperAdmin: false },
      accessLoaded: true,
      accessLoading: false,
    }),

  setAccessLoading: (accessLoading) => set({ accessLoading }),

  setUser: (user) => set({ user }),
}));

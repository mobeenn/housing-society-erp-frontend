import { create } from "zustand";

/**
 * Single light nature theme only — dark mode removed.
 */
export const THEME_STORAGE_KEY = "civica-theme";

export const useThemeStore = create(() => ({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
}));

export const initializeTheme = () => {
  if (typeof document === "undefined") return;
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "light";
  try {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // ignore
  }
  useThemeStore.setState({ theme: "light" });
};

import { create } from "zustand";

export const THEME_STORAGE_KEY = "kceb-theme";

const getInitialTheme = () => {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // Storage and media-query access can be unavailable in restricted browsers.
  }

  return "light";
};

const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The selected theme still applies for the current session.
    }
    set({ theme: nextTheme });
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
}));

export const initializeTheme = () => {
  const theme = getInitialTheme();
  applyTheme(theme);
  useThemeStore.setState({ theme });
};

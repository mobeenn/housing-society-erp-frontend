/**
 * Tailwind v4 loads this file through the @config directive in index.css.
 * The CSS-first @theme block remains the runtime source of truth; these
 * extensions keep the same semantic names available to legacy tooling.
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-bg-canvas)",
        surface: "var(--color-bg-surface)",
        "surface-raised": "var(--color-bg-surface-raised)",
        "surface-muted": "var(--color-bg-surface-muted)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
        accent: "var(--color-accent-primary)",
        "accent-hover": "var(--color-accent-primary-hover)",
        gold: "var(--color-accent-gold)",
        "gold-soft": "var(--color-accent-gold-soft)",
        success: "var(--color-success)",
        "success-soft": "var(--color-success-soft)",
        warning: "var(--color-warning)",
        "warning-soft": "var(--color-warning-soft)",
        danger: "var(--color-danger)",
        "danger-soft": "var(--color-danger-soft)",
        info: "var(--color-info)",
        "info-soft": "var(--color-info-soft)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["2.25rem", { lineHeight: "1.15", fontWeight: "700" }],
        h1: ["1.5rem", { lineHeight: "1.25", fontWeight: "700" }],
        h2: ["1.125rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["0.8125rem", { lineHeight: "1.4", fontWeight: "400" }],
        label: ["0.8125rem", { lineHeight: "1.3", fontWeight: "500" }],
      },
      borderRadius: {
        control: "var(--radius-control)",
        card: "var(--radius-card)",
        badge: "var(--radius-badge)",
      },
      boxShadow: {
        overlay: "var(--shadow-overlay)",
      },
    },
  },
};

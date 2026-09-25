const colorMap = {
  primary: "bg-accent text-on-accent",
  accent: "bg-accent text-on-accent",
  gold: "bg-gold-soft text-gold",
  secondary: "bg-info-soft text-info",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface-muted text-secondary",
};

export default function Badge({ children, color = "primary", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-badge px-2.5 py-0.5 text-small font-semibold
        ${colorMap[color] || colorMap.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

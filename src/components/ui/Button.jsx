import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover focus:ring-accent/40",
  secondary: "border border-border bg-surface-muted text-primary hover:border-border-strong hover:bg-surface-raised focus:ring-accent/30",
  danger: "bg-danger text-on-accent hover:brightness-95 focus:ring-danger/40",
  ghost: "bg-transparent text-secondary hover:bg-surface-muted hover:text-primary focus:ring-accent/30",
  outline: "border border-border-strong bg-transparent text-primary hover:border-accent hover:bg-surface-muted focus:ring-accent/30",
};

const sizes = {
  sm: "min-h-8 px-3 py-1.5 text-small",
  md: "min-h-10 px-4 py-2 text-body",
  lg: "min-h-11 px-5 py-2.5 text-body",
};

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`erp-button inline-flex items-center justify-center gap-2 rounded-control font-semibold
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-canvas
          disabled:cursor-not-allowed disabled:opacity-50
          ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;

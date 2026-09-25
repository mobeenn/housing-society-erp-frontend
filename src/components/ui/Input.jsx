import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-label text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          aria-invalid={Boolean(error) || undefined}
          className={`w-full rounded-control border bg-surface-raised px-3 py-2 text-body text-primary
            placeholder:text-muted transition-colors duration-fast
            focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25
            disabled:cursor-not-allowed disabled:opacity-60
            ${error ? "border-danger focus:border-danger focus:ring-danger/25" : "border-border-strong"}
            ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-small text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors
            placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500
            ${error ? "border-danger-500 focus:ring-danger-500" : "border-neutral-300"}
            ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-danger-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

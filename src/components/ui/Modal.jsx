import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div
      ref={overlayRef}
      onClick={(event) => event.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`erp-overlay-panel w-full ${widths[size] || widths.md} rounded-card border border-border bg-surface-raised shadow-overlay ${className}`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-h2 text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-control p-1.5 text-muted transition-colors duration-fast hover:bg-surface-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

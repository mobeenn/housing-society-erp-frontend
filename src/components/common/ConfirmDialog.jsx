import { X } from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * Reusable confirmation dialog component. Props and callbacks are unchanged.
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-label={title} className="erp-overlay-panel mx-4 w-full max-w-md rounded-card border border-border bg-surface-raised shadow-overlay">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-h2 text-primary">{title}</h2>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Close dialog" className="rounded-control p-1 text-muted hover:bg-surface-muted hover:text-primary disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4"><p className="text-body text-secondary">{message}</p></div>
        <div className="flex items-center justify-end gap-3 border-t border-border bg-surface-muted px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelText}</Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>{loading ? "Processing..." : confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

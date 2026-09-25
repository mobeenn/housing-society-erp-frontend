import { AlertTriangle } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  variant = "danger",
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-danger-soft p-2 text-danger">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-body text-secondary">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

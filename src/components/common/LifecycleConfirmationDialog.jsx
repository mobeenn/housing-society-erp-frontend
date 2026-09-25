import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function LifecycleConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  expectedText,
  title = "Confirm irreversible action",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm permanently",
  isLoading = false,
}) {
  const [confirmation, setConfirmation] = useState("");
  useEffect(() => {
    if (isOpen) setConfirmation("");
  }, [isOpen, expectedText]);
  const matches = confirmation === expectedText;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-control bg-danger-soft p-3 text-body text-danger">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{message}</p>
        </div>
        <div>
          <label className="text-label text-secondary">
            Type <code className="font-mono text-danger">{expectedText}</code> to continue
          </label>
          <input
            autoFocus
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={isLoading}
            className="mt-1 w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2 font-mono text-body text-primary focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/25"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="danger" onClick={() => onConfirm(confirmation)} disabled={!matches} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

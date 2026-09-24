import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Input, Modal } from "@/components/ui";
import { addRecoveryCall } from "../recoveryApi";

const OUTCOMES = ["Connected", "NoAnswer", "PromiseToPay", "Paid", "Escalated", "WrongNumber", "Other"];

export default function AddCallDialog({ isOpen, onClose, assignment, onSaved }) {
  const [form, setForm] = useState({ outcome: "Connected", notes: "", commitmentDate: "", commitmentAmount: "" });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!assignment?._id) return;
    setLoading(true);
    try {
      await addRecoveryCall(assignment._id, {
        outcome: form.outcome,
        notes: form.notes,
        commitmentDate: form.commitmentDate || null,
        commitmentAmount: form.commitmentAmount === "" ? null : Number(form.commitmentAmount),
      });
      toast.success("Recovery call logged");
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to log recovery call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Recovery Call" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-800">
          {assignment?.memberRef?.name || "Member"} · {assignment?.plotRef?.plotNumber || assignment?.booking}
        </div>
        <label className="block text-sm font-medium text-neutral-700">
          Outcome
          <select value={form.outcome} onChange={(event) => update("outcome", event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-normal">
            {OUTCOMES.map((outcome) => <option key={outcome} value={outcome}>{outcome}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-neutral-700">
          Notes
          <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} rows={4} placeholder="What was discussed?" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-neutral-700">
            Commitment date
            <Input type="date" value={form.commitmentDate} onChange={(event) => update("commitmentDate", event.target.value)} className="mt-1" />
          </label>
          <label className="block text-sm font-medium text-neutral-700">
            Commitment amount
            <Input type="number" min="0" step="0.01" value={form.commitmentAmount} onChange={(event) => update("commitmentAmount", event.target.value)} className="mt-1" />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Call"}</Button>
        </div>
      </form>
    </Modal>
  );
}

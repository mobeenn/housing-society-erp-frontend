import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createExpense } from "./expensesApi";

export default function ExpenseFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: "Utilities",
    vendor: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createExpense({
        ...form,
        amount: Number(form.amount),
        date: new Date(form.date).toISOString(),
      });
      toast.success("Expense submitted for approval");
      navigate("/expenses");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create expense");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/expenses")}
          className="rounded-control p-2 hover:bg-surface-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-h1 font-bold text-primary">Add Expense</h1>
          <p className="mt-1 text-body text-secondary">
            Submit an operating cost for approval.
          </p>
        </div>
      </div>
      <form
        onSubmit={save}
        className="space-y-5 rounded-card border border-border bg-surface p-6 shadow-none"
      >
        <label className="block text-body font-medium text-primary">
          Category *
          <input
            required
            name="category"
            value={form.category}
            onChange={change}
            className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
          />
        </label>
        <label className="block text-body font-medium text-primary">
          Vendor
          <input
            name="vendor"
            value={form.vendor}
            onChange={change}
            className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            placeholder="Vendor name (optional)"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-body font-medium text-primary">
            Amount *
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              name="amount"
              value={form.amount}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            />
          </label>
          <label className="text-body font-medium text-primary">
            Date *
            <input
              required
              type="date"
              name="date"
              value={form.date}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => navigate("/expenses")}
            className="rounded-control border border-border-strong px-4 py-2 text-body"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="rounded-control bg-accent px-5 py-2 text-body font-medium text-on-accent disabled:opacity-50"
          >
            {saving ? "Saving..." : "Submit expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

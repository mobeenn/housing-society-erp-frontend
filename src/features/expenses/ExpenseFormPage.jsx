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
          className="rounded-lg p-2 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Add Expense</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Submit an operating cost for approval.
          </p>
        </div>
      </div>
      <form
        onSubmit={save}
        className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <label className="block text-sm font-medium text-neutral-700">
          Category *
          <input
            required
            name="category"
            value={form.category}
            onChange={change}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-700">
          Vendor
          <input
            name="vendor"
            value={form.vendor}
            onChange={change}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
            placeholder="Vendor name (optional)"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-neutral-700">
            Amount *
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              name="amount"
              value={form.amount}
              onChange={change}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
            />
          </label>
          <label className="text-sm font-medium text-neutral-700">
            Date *
            <input
              required
              type="date"
              name="date"
              value={form.date}
              onChange={change}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
          <button
            type="button"
            onClick={() => navigate("/expenses")}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Submit expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { ArrowLeft, Calculator } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getMembers } from "@/features/members/membersApi";
import { getPlots } from "@/features/properties/propertiesApi";
import { PAYMENT_METHODS, createPayment, previewPayment } from "./paymentsApi";

export default function RecordPaymentPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [plots, setPlots] = useState([]);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    member: "",
    plot: "",
    amount: "",
    method: "Cash",
    remarks: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewError, setPreviewError] = useState("");
  useEffect(() => {
    Promise.all([
      getMembers({ page: 1, limit: 100 }),
      getPlots({ page: 1, limit: 100 }),
    ])
      .then(([memberResult, plotResult]) => {
        setMembers(memberResult.data || []);
        setPlots(plotResult.data || []);
      })
      .catch((error) =>
        toast.error(
          error.response?.data?.message || "Failed to load payment options",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!form.member || Number(form.amount) <= 0) {
      setPreview(null);
      return;
    }
    const timer = setTimeout(
      () =>
        previewPayment({
          member: form.member,
          plot: form.plot || null,
          amount: Number(form.amount),
        })
          .then(setPreview)
          .catch((error) => {
            setPreview(null);
            setPreviewError(
              error.response?.data?.message ||
                "Payment exceeds outstanding balance",
            );
          }),
      250,
    );
    setPreviewError("");
    return () => clearTimeout(timer);
  }, [form.member, form.plot, form.amount]);
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payment = await createPayment({
        ...form,
        plot: form.plot || null,
        amount: Number(form.amount),
      });
      toast.success(`Payment ${payment.receiptNumber} recorded`);
      navigate(`/payments/${payment._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="py-16 text-center text-neutral-500">
        Loading payment options...
      </div>
    );
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/payments")}
          className="rounded-lg p-2 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Record Payment
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Apply funds to the oldest outstanding installments first.
          </p>
        </div>
      </div>
      <form
        onSubmit={save}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]"
      >
        <div className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-neutral-700">
              Member *
              <select
                required
                name="member"
                value={form.member}
                onChange={change}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              >
                <option value="">Select member</option>
                {members.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} ({item.memberId})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Plot (optional)
              <select
                name="plot"
                value={form.plot}
                onChange={change}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              >
                <option value="">All member installments</option>
                {plots.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.plotNumber}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-neutral-700">
              Amount *
              <input
                required
                min="0.01"
                type="number"
                step="0.01"
                name="amount"
                value={form.amount}
                onChange={change}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Method
              <select
                name="method"
                value={form.method}
                onChange={change}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method}>{method}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="text-sm font-medium text-neutral-700">
            Remarks
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={change}
              rows={3}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
            />
          </label>
          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
            <button
              type="button"
              onClick={() => navigate("/payments")}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              disabled={saving || !preview || Boolean(previewError)}
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Recording..." : "Record payment"}
            </button>
          </div>
        </div>
        <aside className="h-fit rounded-xl border border-primary-100 bg-primary-50 p-5">
          <div className="flex items-center gap-2 font-semibold text-primary-900">
            <Calculator className="h-4 w-4" /> Allocation preview
          </div>
          {previewError ? (
            <p className="mt-5 text-sm text-danger-700">{previewError}</p>
          ) : preview ? (
            <div className="mt-5 space-y-3 text-sm">
              <p className="font-medium">
                {preview.allocations.length} installment(s) will receive this
                payment.
              </p>
              {preview.installmentUpdates.map((item) => (
                <div key={item.id} className="rounded-lg bg-white p-3">
                  <div className="flex justify-between">
                    <span>Applied</span>
                    <strong>
                      {Number(
                        preview.allocations.find(
                          (allocation) => allocation.installment === item.id,
                        )?.amountApplied || 0,
                      ).toLocaleString()}
                    </strong>
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Remaining balance: {Number(item.balance).toLocaleString()} ·{" "}
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-primary-800">
              Select a member and enter an amount to preview allocation.
            </p>
          )}
        </aside>
      </form>
    </div>
  );
}

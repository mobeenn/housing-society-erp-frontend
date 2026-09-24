import { useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "@/lib/apiClient";
import StatusPill from "@/components/ui/StatusPill";
import { downloadReceipt } from "./paymentsApi";

export default function PaymentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiClient
      .get(`/payments/${id}`)
      .then((response) => setPayment(response.data.data))
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to load payment");
        navigate("/payments");
      })
      .finally(() => setLoading(false));
  }, [id]);
  const print = async () => {
    try {
      const blob = await downloadReceipt(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error.response?.data?.message || "Receipt generation failed");
    }
  };
  if (loading)
    return (
      <div className="py-16 text-center text-neutral-500">
        Loading payment...
      </div>
    );
  if (!payment) return null;
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/payments")}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {payment.receiptNumber}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {payment.memberRef?.name || "—"} ·{" "}
              {payment.plotRef?.plotNumber || "—"}
            </p>
          </div>
        </div>
        <button
          onClick={print}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Printer className="h-4 w-4" /> Print receipt
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["Amount", Number(payment.amount).toLocaleString()],
          ["Method", payment.method],
          ["Status", payment.status],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-1 font-semibold text-neutral-900">
              {label === "Status" ? <StatusPill status={value} /> : value}
            </p>
          </div>
        ))}
      </div>
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-neutral-900">Allocations</h2>
        <div className="mt-4 space-y-2">
          {(payment.allocations || []).map((allocation) => (
            <div
              key={allocation.installment}
              className="flex justify-between border-b border-neutral-100 py-2 text-sm"
            >
              <span className="font-mono text-neutral-500">
                {allocation.installment}
              </span>
              <strong>
                {Number(allocation.amountApplied).toLocaleString()}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

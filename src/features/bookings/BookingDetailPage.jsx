import { useEffect, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useCan } from "@/hooks/useCan";
import StatusPill from "@/components/ui/StatusPill";
import DocumentUploader from "@/components/documents/DocumentUploader";
import DocumentList from "@/components/documents/DocumentList";
import {
  approveBooking,
  cancelBooking,
  getBookingById,
  rejectBooking,
} from "./bookingsApi";

export default function BookingDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentRefreshKey, setDocumentRefreshKey] = useState(0);
  const canApprove = useCan("bookings", "approve");
  const canReject = useCan("bookings", "reject");
  const canCancel = useCan("bookings", "cancel");
  const load = () =>
    getBookingById(id)
      .then(setBooking)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to load booking");
        navigate("/bookings");
      })
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, [id]);
  const approve = async () => {
    try {
      await approveBooking(id, booking.planTemplate);
      toast.success("Booking approved and installment plan generated");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed");
    }
  };
  const reject = async () => {
    const reason = window.prompt("Rejection reason");
    if (!reason) return;
    try {
      await rejectBooking(id, reason);
      toast.success("Booking rejected");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Rejection failed");
    }
  };
  const cancel = async () => {
    const reason = window.prompt("Cancellation reason");
    if (!reason) return;
    const refund = window.prompt("Refund amount", "0");
    try {
      await cancelBooking(id, reason, Number(refund || 0));
      toast.success("Booking cancelled and plot released");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancellation failed");
    }
  };
  if (loading)
    return (
      <div className="py-16 text-center text-secondary">
        Loading booking...
      </div>
    );
  if (!booking) return null;
  const plan = booking.installmentPlan;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/bookings")}
            className="rounded-control p-2 hover:bg-surface-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-h1 font-bold text-primary">Booking</h1>
              <StatusPill status={booking.status} />
            </div>
            <p className="mt-1 text-body text-secondary">
              {booking.memberRef?.name || "—"} ·{" "}
              {booking.plotRef?.plotNumber || "—"}
            </p>
          </div>
        </div>
        {(canApprove || canReject) && booking.status === "Pending Approval" && (
          <div className="flex gap-2">
            {canReject && <button
              onClick={reject}
              className="flex items-center gap-2 rounded-control border border-danger px-3 py-2 text-body text-danger"
            >
              <X className="h-4 w-4" /> Reject
            </button>}
            {canApprove && <button
              onClick={approve}
              className="flex items-center gap-2 rounded-control bg-success px-3 py-2 text-body font-medium text-on-accent"
            >
              <Check className="h-4 w-4" /> Approve
            </button>}
          </div>
        )}
        {canCancel && booking.status === "Confirmed" && (
          <button
            onClick={cancel}
            className="rounded-control border border-danger px-3 py-2 text-body text-danger"
          >
            Cancel booking
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ["Plot status", booking.plotRef?.status],
          ["Price", Number(booking.price).toLocaleString()],
          ["Booking amount", Number(booking.bookingAmount).toLocaleString()],
          [
            "Net payable",
            (
              Number(booking.price) -
              Number(booking.discount) +
              Number(booking.developmentCharges) +
              Number(booking.additionalCharges)
            ).toLocaleString(),
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-card border border-border bg-surface p-4 shadow-none"
          >
            <p className="text-small text-secondary">{label}</p>
            <p className="mt-1 font-semibold text-primary">
              {value || "—"}
            </p>
          </div>
        ))}
      </div>
      {plan ? (
        <section className="rounded-card border border-border bg-surface shadow-none">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-primary">Installment plan</h2>
            <p className="mt-1 text-body text-secondary">
              {plan.numberOfInstallments} {plan.frequency} installments ·
              Outstanding {Number(plan.totalAmount).toLocaleString()}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body">
              <thead className="bg-canvas text-small text-secondary">
                <tr>
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Due date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Paid</th>
                  <th className="px-5 py-3">Balance</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(plan.installments || []).map((item, index) => (
                  <tr key={item._id}>
                    <td className="px-5 py-3">{index + 1}</td>
                    <td className="px-5 py-3">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {Number(item.amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      {Number(item.paidAmount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      {Number(item.balance).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="rounded-card border border-dashed border-border-strong bg-surface p-8 text-center text-body text-secondary">
          Installment plan will be generated when this booking is approved.
        </section>
      )}
      <section className="rounded-card border border-border bg-surface p-5 shadow-none">
        <h2 className="mb-4 text-h2 font-semibold text-primary">
          Documents
        </h2>
        <div className="space-y-5">
          <DocumentUploader
            relatedEntityType="booking"
            relatedEntityId={id}
            onUploaded={() => setDocumentRefreshKey((key) => key + 1)}
          />
          <DocumentList
            relatedEntityType="booking"
            relatedEntityId={id}
            refreshKey={documentRefreshKey}
          />
        </div>
      </section>
    </div>
  );
}

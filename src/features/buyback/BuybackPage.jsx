import { useEffect, useMemo, useState } from "react";
import { ArchiveRestore, FileText, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button, Card, Input } from "@/components/ui";
import LifecycleConfirmationDialog from "@/components/common/LifecycleConfirmationDialog";
import { openInvoiceFile } from "@/features/invoices/invoicesApi";
import { useCan } from "@/hooks/useCan";
import { executeBuyback, getEligibleBookings, listBuybacks } from "./buybackApi";
import { LIFECYCLE_CONFIRMATION, lifecycleStatusClass } from "@/features/lifecycle/confirmation";

export default function BuybackPage() {
  const [bookings, setBookings] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ booking: "", type: "BuyBack", paymentType: "Cash", deductionPercent: 0, settlementAmount: "", remarks: "" });
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const canView = useCan("buyback", "view");
  const canCreate = useCan("buyback", "create");

  const load = async () => {
    try {
      const [bookingResult, recordResult] = await Promise.all([
        getEligibleBookings(),
        listBuybacks({ page: 1, limit: 50 }),
      ]);
      setBookings(Array.isArray(bookingResult) ? bookingResult : bookingResult?.data || []);
      setRecords(recordResult?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load buyback data");
    }
  };
  useEffect(() => { load(); }, []);

  const eligibleBookings = useMemo(() => bookings.filter((booking) => !booking.archived && !booking.isArchived && booking.status !== "Cancelled"), [bookings]);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const confirmation = form.type === "Cancel" ? LIFECYCLE_CONFIRMATION.CANCEL : LIFECYCLE_CONFIRMATION.BUYBACK;

  const execute = async (confirmationText) => {
    if (!form.booking) { toast.error("Select a booking"); return; }
    setSaving(true);
    try {
      const result = await executeBuyback({
        booking: form.booking,
        type: form.type,
        paymentType: form.paymentType,
        deductionPercent: Number(form.deductionPercent || 0),
        settlementAmount: Number(form.settlementAmount || 0),
        remarks: form.remarks,
        confirmationText,
      });
      toast.success(`${form.type} completed successfully`);
      setConfirmOpen(false);
      setForm({ booking: "", type: "BuyBack", paymentType: "Cash", deductionPercent: 0, settlementAmount: "", remarks: "" });
      await load();
      if (result?.invoiceUrl) openInvoiceFile(result.invoiceUrl).catch(() => toast.error("Action completed; open the invoice from the registry"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Buyback/cancellation failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5" data-tour="buyback-page">
      <Card title="Buyback / Cancel Booking" actions={<Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>}>
        <div className="mb-4 flex items-start gap-2 rounded-control bg-danger-soft p-3 text-body text-danger" data-tour="buyback-warning"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>This action is irreversible. Buyback releases the plot to <strong>Available</strong>; Cancel marks the plot <strong>Cancelled</strong>. The booking is archived, never deleted.</span></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="text-body font-medium text-primary lg:col-span-2" data-tour="buyback-booking">Booking<select value={form.booking} onChange={(event) => { update("booking", event.target.value); const booking = eligibleBookings.find((item) => item._id === event.target.value); if (booking) update("settlementAmount", String(booking.bookingAmount || booking.price || 0)); }} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body"><option value="">Select an active booking</option>{eligibleBookings.map((booking) => <option key={booking._id} value={booking._id}>{booking.bookingNumber || booking._id} · Plot {booking.plotNumber || booking.plot}</option>)}</select></label>
          <label className="text-body font-medium text-primary" data-tour="buyback-action">Action<select value={form.type} onChange={(event) => update("type", event.target.value)} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body"><option value="BuyBack">BuyBack</option><option value="Cancel">Cancel</option></select></label>
          <label className="text-body font-medium text-primary">Payment type<select value={form.paymentType} onChange={(event) => update("paymentType", event.target.value)} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body"><option>Cash</option><option>Adjustment</option><option>Online</option></select></label>
          <Input label="Deduction (%)" type="number" min="0" max="100" step="0.01" value={form.deductionPercent} onChange={(event) => update("deductionPercent", event.target.value)} />
          <Input label="Settlement amount" type="number" min="0" step="0.01" value={form.settlementAmount} onChange={(event) => update("settlementAmount", event.target.value)} />
          <Input label="Remarks" value={form.remarks} onChange={(event) => update("remarks", event.target.value)} placeholder="Optional settlement remarks" />
        </div>
        {canCreate && <div className="mt-4 flex justify-end"><Button data-tour="buyback-review" disabled={!form.booking} onClick={() => setConfirmOpen(true)}><ArchiveRestore className="h-4 w-4" /> Review irreversible action</Button></div>}
      </Card>

      {canView && <Card title="Action History"><div className="overflow-x-auto" data-tour="buyback-history"><table className="w-full text-left text-body"><thead className="border-b border-border text-small text-secondary"><tr><th className="px-3 py-3">Date</th><th className="px-3 py-3">Plot</th><th className="px-3 py-3">Booking</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Settlement</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Invoice</th></tr></thead><tbody className="divide-y divide-border">{records.map((record) => <tr key={record._id}><td className="px-3 py-3">{new Date(record.date).toLocaleString()}</td><td className="px-3 py-3">{record.plotRef?.plotNumber || record.plot}</td><td className="px-3 py-3">{record.booking}</td><td className="px-3 py-3">{record.type}</td><td className="px-3 py-3">{record.settlementAmount}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-small ${lifecycleStatusClass(record.status)}`}>{record.status}</span></td><td className="px-3 py-3">{record.invoiceUrl && <Button size="sm" variant="outline" onClick={() => openInvoiceFile(record.invoiceUrl).catch((error) => toast.error(error.message))}><FileText className="h-4 w-4" /> View</Button>}</td></tr>)}{records.length === 0 && <tr><td colSpan="7" className="px-3 py-8 text-center text-secondary">No buyback records.</td></tr>}</tbody></table></div></Card>}

      <LifecycleConfirmationDialog isOpen={confirmOpen} onClose={() => !saving && setConfirmOpen(false)} onConfirm={execute} expectedText={confirmation} title={`Permanently ${form.type === "Cancel" ? "cancel" : "buy back"} this booking?`} message="This cannot be undone. The booking will be archived and the plot lifecycle will change permanently." confirmLabel={`${form.type} permanently`} isLoading={saving} />
    </div>
  );
}

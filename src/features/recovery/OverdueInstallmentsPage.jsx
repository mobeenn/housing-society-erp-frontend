import { useEffect, useMemo, useState } from "react";
import { BellRing, Download, Filter, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Card, Input, StatusPill } from "@/components/ui";
import { useCan } from "@/hooks/useCan";
import { exportOverdueRecovery, getOverdueRecovery, sendRecoveryReminders } from "./recoveryApi";

const currency = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "—";
const emptyFilters = { search: "", minDaysOverdue: "", maxDaysOverdue: "", minRecoveryPercent: "", maxRecoveryPercent: "" };

export default function OverdueInstallmentsPage() {
  const canRemind = useCan("recovery", "edit");
  const canExport = useCan("recovery", "export");
  const [filters, setFilters] = useState(emptyFilters);
  const [data, setData] = useState({ data: [], pagination: { page: 1, pages: 0, total: 0 }, summary: {} });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setData(await getOverdueRecovery({ ...filters, page, limit: 20 }));
      setSelected(new Set());
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load overdue installments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters, page]);

  const update = (key, value) => { setPage(1); setFilters((current) => ({ ...current, [key]: value })); };
  const toggle = (id) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const allSelected = data.data.length > 0 && data.data.every((row) => selected.has(row._id));
  const selectedBookings = useMemo(() => [...new Set(data.data.filter((row) => selected.has(row._id)).map((row) => row.bookingId))], [data.data, selected]);

  const sendReminders = async () => {
    if (!selectedBookings.length) return;
    try {
      const result = await sendRecoveryReminders(selectedBookings);
      toast.success(`${result.sent} reminder(s) sent in-app`);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send reminders");
    }
  };

  const exportRows = async () => {
    try {
      const blob = await exportOverdueRecovery(filters);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "recovery-overdue.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to export overdue installments");
    }
  };

  return (
    <div data-tour="recovery-page-intro" className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div data-tour="recovery-title"><h1 className="text-2xl font-bold text-neutral-900">Overdue Installments</h1><p className="mt-1 text-sm text-neutral-500">Filter, remind members, and export recovery work from one place.</p></div><div data-tour="recovery-actions" className="flex gap-2"><Button variant="outline" onClick={load} disabled={loading}><RefreshCw className="h-4 w-4" /> Refresh</Button>{canExport && <Button variant="outline" onClick={exportRows}><Download className="h-4 w-4" /> Export Excel</Button>}</div></div>
      <Card title="Filters"><div data-tour="recovery-work-area" className="grid gap-3 md:grid-cols-3 xl:grid-cols-6"><Field label="Search"><Input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Member, plot, booking" /></Field><Field label="Min overdue days"><Input type="number" min="0" value={filters.minDaysOverdue} onChange={(event) => update("minDaysOverdue", event.target.value)} /></Field><Field label="Max overdue days"><Input type="number" min="0" value={filters.maxDaysOverdue} onChange={(event) => update("maxDaysOverdue", event.target.value)} /></Field><Field label="Min recovery %"><Input type="number" min="0" max="100" value={filters.minRecoveryPercent} onChange={(event) => update("minRecoveryPercent", event.target.value)} /></Field><Field label="Max recovery %"><Input type="number" min="0" max="100" value={filters.maxRecoveryPercent} onChange={(event) => update("maxRecoveryPercent", event.target.value)} /></Field><div className="flex items-end"><Button type="button" variant="outline" onClick={() => { setPage(1); setFilters(emptyFilters); }}><Filter className="h-4 w-4" /> Clear</Button></div></div></Card>
      <div className="grid gap-4 sm:grid-cols-3"><Kpi label="Installments" value={data.summary?.installmentCount || 0} /><Kpi label="Bookings" value={data.summary?.bookingCount || 0} /><Kpi label="Outstanding" value={currency.format(data.summary?.totalOutstanding || 0)} /></div>
      <Card title={`Overdue List (${data.pagination?.total || 0})`} actions={canRemind && <Button size="sm" onClick={sendReminders} disabled={!selectedBookings.length}><BellRing className="h-3.5 w-3.5" /> Send Reminder ({selectedBookings.length})</Button>}><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500"><tr><th className="w-10 px-3 py-3"><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(data.data.map((row) => row._id)))} aria-label="Select all overdue installments" /></th><th className="px-3 py-3">Member / Plot</th><th className="px-3 py-3">Due Date</th><th className="px-3 py-3">Outstanding</th><th className="px-3 py-3">Recovery %</th><th className="px-3 py-3">Overdue Days</th><th className="px-3 py-3">Status</th></tr></thead><tbody className="divide-y divide-neutral-100">{data.data.map((row) => <tr key={row._id} className="hover:bg-neutral-50"><td className="px-3 py-3"><input type="checkbox" checked={selected.has(row._id)} onChange={() => toggle(row._id)} aria-label={`Select installment ${row._id}`} /></td><td className="px-3 py-3"><p className="font-medium text-neutral-800">{row.memberRef?.name || "—"}</p><p className="text-xs text-neutral-400">{row.memberRef?.memberId || "—"} · {row.plotRef?.plotNumber || "—"}</p></td><td className="px-3 py-3">{formatDate(row.dueDate)}</td><td className="px-3 py-3">{currency.format(row.outstandingAmount)}</td><td className="px-3 py-3">{Number(row.recoveryPercent || 0).toFixed(1)}%</td><td className="px-3 py-3">{row.daysOverdue}</td><td className="px-3 py-3"><StatusPill status="Overdue" /></td></tr>)}</tbody></table>{data.data.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">No overdue installments match these filters.</p>}</div>{(data.pagination?.pages || 0) > 1 && <div className="mt-4 flex items-center justify-end gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-xs text-neutral-500">Page {page} of {data.pagination.pages}</span><Button size="sm" variant="outline" disabled={page >= data.pagination.pages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}</Card>
    </div>
  );
}

function Field({ label, children }) { return <label className="text-sm font-medium text-neutral-700">{label}<div className="mt-1">{children}</div></label>; }
function Kpi({ label, value }) { return <Card><p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p><p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p></Card>; }

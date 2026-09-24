import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Plus, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button, Card, Input } from "@/components/ui";
import Modal from "@/components/ui/Modal";
import { useCan } from "@/hooks/useCan";
import { completeRegistryBatch, createRegistryBatch, listRegistryBatches, listRegistryPlotOptions } from "./registryApi";
import { lifecycleStatusClass } from "@/features/lifecycle/confirmation";

export default function RegistryPage() {
  const [batches, setBatches] = useState([]);
  const [plots, setPlots] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ plots: [], requestDate: new Date().toISOString().slice(0, 10), remarks: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const canView = useCan("registry", "view");
  const canCreate = useCan("registry", "create");
  const canEdit = useCan("registry", "edit");

  const load = async () => {
    setLoading(true);
    try {
      const [batchResult, plotResult] = await Promise.all([
        listRegistryBatches({ ...filters, limit: 100 }),
        listRegistryPlotOptions({ page: 1, limit: 200 }),
      ]);
      setBatches(batchResult?.data || []);
      setPlots(Array.isArray(plotResult) ? plotResult : plotResult?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load registry batches");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [filters.from, filters.to, filters.status]);

  const eligiblePlots = useMemo(() => plots.filter((plot) => !["Merged", "Cancelled", "BoughtBack"].includes(plot.status)), [plots]);
  const togglePlot = (id) => setForm((current) => ({ ...current, plots: current.plots.includes(id) ? current.plots.filter((item) => item !== id) : [...current.plots, id] }));
  const create = async () => {
    if (!form.plots.length) { toast.error("Select at least one plot"); return; }
    setSaving(true);
    try {
      await createRegistryBatch(form);
      toast.success("Registry batch created");
      setModalOpen(false);
      setForm({ plots: [], requestDate: new Date().toISOString().slice(0, 10), remarks: "" });
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create registry batch");
    } finally { setSaving(false); }
  };
  const complete = async (batch) => {
    try {
      await completeRegistryBatch(batch._id);
      toast.success("Registry batch marked complete");
      await load();
    } catch (error) { toast.error(error.response?.data?.message || "Failed to complete batch"); }
  };

  return (
    <div className="space-y-5" data-tour="registry-page">
      <Card title="Paperwork Registry" actions={<><Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>{canCreate && <Button data-tour="registry-new-batch" size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> New Batch</Button>}</>}>
        <p className="mb-4 text-sm text-neutral-500" data-tour="registry-overview">Track physical document batches separately from transfer, NOC, possession, and construction workflows.</p>
        <div className="grid gap-3 md:grid-cols-3" data-tour="registry-filters"><Input label="From" type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} /><Input label="To" type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} /><label className="text-sm font-medium text-neutral-700">Status<select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"><option value="">All statuses</option><option value="Requested">Requested</option><option value="Completed">Completed</option></select></label></div>
      </Card>

      {canView && <Card title="Registry Batches">{loading ? <p className="py-8 text-center text-sm text-neutral-500">Loading batches...</p> : batches.length === 0 ? <div className="py-10 text-center"><ClipboardList className="mx-auto mb-2 h-9 w-9 text-neutral-300" /><p className="text-sm text-neutral-500">No registry batches found.</p></div> : <div className="overflow-x-auto" data-tour="registry-batches"><table className="w-full text-left text-sm"><thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500"><tr><th className="px-3 py-3">Requested</th><th className="px-3 py-3">Plots</th><th className="px-3 py-3">Remarks</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Completed</th><th className="px-3 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-neutral-100">{batches.map((batch) => <tr key={batch._id}><td className="px-3 py-3">{batch.requestDate}</td><td className="px-3 py-3">{batch.plotRefs?.map((plot) => plot.plotNumber || plot.fileNumber).filter(Boolean).join(", ") || batch.plots?.length}</td><td className="max-w-xs px-3 py-3 text-neutral-600">{batch.remarks || "—"}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs ${lifecycleStatusClass(batch.status)}`}>{batch.status}</span></td><td className="px-3 py-3">{batch.completedDate ? new Date(batch.completedDate).toLocaleString() : "—"}</td><td className="px-3 py-3 text-right">{canEdit && batch.status === "Requested" && <Button size="sm" onClick={() => complete(batch)}><CheckCircle2 className="h-4 w-4" /> Mark complete</Button>}</td></tr>)}</tbody></table></div>}</Card>}

      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title="Create Registry Batch" size="lg"><div className="space-y-4" data-tour="registry-batch-form"><Input label="Request date" type="date" value={form.requestDate} onChange={(event) => setForm((current) => ({ ...current, requestDate: event.target.value }))} /><Input label="Remarks" value={form.remarks} onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))} placeholder="Optional batch remarks" /><div><p className="mb-2 text-sm font-medium text-neutral-700">Select plots</p><div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 p-2">{eligiblePlots.map((plot) => <label key={plot._id} className="flex items-center gap-2 rounded p-2 text-sm hover:bg-neutral-50"><input type="checkbox" checked={form.plots.includes(plot._id)} onChange={() => togglePlot(plot._id)} /><span>{plot.plotNumber} {plot.fileNumber ? `(${plot.fileNumber})` : ""}</span></label>)}</div></div><div className="flex justify-end gap-2 border-t border-neutral-100 pt-4"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button><Button data-tour="registry-create-batch" onClick={create} isLoading={saving}>Create Batch</Button></div></div></Modal>
    </div>
  );
}

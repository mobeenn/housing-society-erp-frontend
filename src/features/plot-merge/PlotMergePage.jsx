import { useEffect, useMemo, useState } from "react";
import { Combine, FileText, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button, Card, Input } from "@/components/ui";
import LifecycleConfirmationDialog from "@/components/common/LifecycleConfirmationDialog";
import { openInvoiceFile } from "@/features/invoices/invoicesApi";
import { useCan } from "@/hooks/useCan";
import { executePlotMerge, getEligiblePlots, listPlotMerges } from "./plotMergeApi";
import { LIFECYCLE_CONFIRMATION, lifecycleStatusClass } from "@/features/lifecycle/confirmation";

export default function PlotMergePage() {
  const [plots, setPlots] = useState([]);
  const [merges, setMerges] = useState([]);
  const [selected, setSelected] = useState([]);
  const [resultingPlot, setResultingPlot] = useState("");
  const [amounts, setAmounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const canView = useCan("plot-merge", "view");
  const canCreate = useCan("plot-merge", "create");

  const load = async () => {
    setLoading(true);
    try {
      const [plotResult, mergeResult] = await Promise.all([
        getEligiblePlots(),
        listPlotMerges({ page: 1, limit: 50 }),
      ]);
      setPlots(Array.isArray(plotResult) ? plotResult : plotResult?.data || []);
      setMerges(mergeResult?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load plot merge data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const availablePlots = useMemo(() => plots.filter((plot) => !["Merged", "Cancelled", "BoughtBack"].includes(plot.status)), [plots]);
  const togglePlot = (id) => {
    setSelected((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      if (!next.includes(resultingPlot)) setResultingPlot(next[0] || "");
      return next;
    });
  };
  const setAmount = (id, value) => setAmounts((current) => ({ ...current, [id]: value }));

  const execute = async (confirmationText) => {
    if (selected.length < 2 || !resultingPlot) {
      toast.error("Select at least two plots and a resulting plot");
      return;
    }
    setSaving(true);
    try {
      const result = await executePlotMerge({
        mergedPlots: selected,
        resultingPlot,
        adjustedAmounts: selected.map((plot) => ({ plot, amount: Number(amounts[plot] || 0), reason: "Merge adjustment" })),
        confirmationText,
      });
      toast.success("Plots merged successfully");
      setConfirmOpen(false);
      setSelected([]);
      setResultingPlot("");
      setAmounts({});
      await load();
      if (result?.invoiceUrl) openInvoiceFile(result.invoiceUrl).catch(() => toast.error("Merge completed; open the invoice from the registry"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Plot merge failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5" data-tour="plot-merge-page">
      <Card title="Plot Merge" actions={<Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>}>
        <div className="mb-4 flex items-start gap-2 rounded-control bg-danger-soft p-3 text-body text-danger" data-tour="plot-merge-warning"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>This action is irreversible. The first selected plot is retained as the resulting unit; all other selected plots will be marked <strong>Merged</strong>.</span></div>
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div>
            <p className="mb-2 text-body font-medium text-primary">Select plots</p>
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-control border border-border p-2" data-tour="plot-merge-plot-selection">
              {loading ? <p className="p-3 text-body text-secondary">Loading plots...</p> : availablePlots.map((plot) => <label key={plot._id} className="flex cursor-pointer items-center gap-3 rounded-control p-2 hover:bg-canvas"><input type="checkbox" checked={selected.includes(plot._id)} onChange={() => togglePlot(plot._id)} className="h-4 w-4" /><span className="flex-1"><span className="block text-body font-medium text-primary">{plot.plotNumber} {plot.fileNumber ? `(${plot.fileNumber})` : ""}</span><span className="text-small text-secondary">{plot.block?.name || plot.block} · {plot.street?.name || plot.street} · {plot.size}</span></span><span className={`rounded-full px-2 py-0.5 text-small ${lifecycleStatusClass(plot.status)}`}>{plot.status}</span></label>)}
              {!loading && availablePlots.length === 0 && <p className="p-3 text-body text-secondary">No eligible plots found.</p>}
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-body font-medium text-primary" data-tour="plot-merge-result">Resulting plot<select value={resultingPlot} onChange={(event) => setResultingPlot(event.target.value)} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body"><option value="">Select resulting plot</option>{selected.map((id) => { const plot = plots.find((item) => item._id === id); return <option key={id} value={id}>{plot?.plotNumber}</option>; })}</select></label>
            {selected.map((id) => { const plot = plots.find((item) => item._id === id); return <Input key={id} label={`Adjustment — ${plot?.plotNumber || id}`} type="number" min="0" step="0.01" value={amounts[id] || ""} onChange={(event) => setAmount(id, event.target.value)} disabled={id === resultingPlot} />; })}
            {canCreate && <Button data-tour="plot-merge-review" className="w-full" disabled={selected.length < 2} onClick={() => setConfirmOpen(true)}><Combine className="h-4 w-4" /> Review irreversible merge</Button>}
          </div>
        </div>
      </Card>

      {canView && <Card title="Merge History"><div className="overflow-x-auto" data-tour="plot-merge-history"><table className="w-full text-left text-body"><thead className="border-b border-border text-small text-secondary"><tr><th className="px-3 py-3">Date</th><th className="px-3 py-3">Resulting plot</th><th className="px-3 py-3">Sources</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Invoice</th></tr></thead><tbody className="divide-y divide-border">{merges.map((merge) => <tr key={merge._id}><td className="px-3 py-3">{new Date(merge.date).toLocaleString()}</td><td className="px-3 py-3">{merge.resultingPlotRef?.plotNumber || merge.resultingPlot}</td><td className="px-3 py-3">{merge.plotRefs?.map((plot) => plot.plotNumber).filter(Boolean).join(", ")}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-small ${lifecycleStatusClass(merge.status)}`}>{merge.status}</span></td><td className="px-3 py-3">{merge.invoiceUrl && <Button size="sm" variant="outline" onClick={() => openInvoiceFile(merge.invoiceUrl).catch((error) => toast.error(error.message))}><FileText className="h-4 w-4" /> View</Button>}</td></tr>)}{merges.length === 0 && <tr><td colSpan="5" className="px-3 py-8 text-center text-secondary">No merges recorded.</td></tr>}</tbody></table></div></Card>}

      <LifecycleConfirmationDialog isOpen={confirmOpen} onClose={() => !saving && setConfirmOpen(false)} onConfirm={execute} expectedText={LIFECYCLE_CONFIRMATION.PLOT_MERGE} title="Permanently merge plots?" message="This cannot be undone. The selected plots and their lifecycle records will be changed permanently." confirmLabel="Merge permanently" isLoading={saving} />
    </div>
  );
}

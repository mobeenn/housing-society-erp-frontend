import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Plus, RefreshCw, Wrench } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import StatusPill from "@/components/ui/StatusPill";
import { administrationApi } from "@/features/settings/administrationApi";
import { createAsset, getAssetHistory, getAssets } from "./maintenanceApi";

const ASSET_TYPES = [
  "road",
  "light",
  "park",
  "water",
  "sewerage",
  "drainage",
  "building",
  "other",
];

export default function AssetsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("id");

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "road",
    location: "",
    block: "",
  });

  const [selectedId, setSelectedId] = useState(preselectedId);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = useCallback(() => {
    const params = {};
    if (typeFilter) params.type = typeFilter;
    return getAssets(params)
      .then((result) => setAssets(result.data || result || []))
      .catch((error) =>
        toast.error(error.response?.data?.message || "Failed to load assets"),
      )
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const loadHistory = useCallback((assetId) => {
    if (!assetId) {
      setHistory(null);
      return;
    }
    setHistoryLoading(true);
    getAssetHistory(assetId)
      .then(setHistory)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to load history");
        setHistory(null);
      })
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (preselectedId) setSelectedId(preselectedId);
  }, [preselectedId]);

  useEffect(() => {
    loadHistory(selectedId);
  }, [selectedId, loadHistory]);

  useEffect(() => {
    administrationApi
      .getMasterData("blocks")
      .then((data) => setBlocks(Array.isArray(data) ? data : data.data || []))
      .catch(() => setBlocks([]));
  }, []);

  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const asset = await createAsset({
        name: form.name,
        type: form.type,
        location: form.location || null,
        block: form.block || null,
      });
      toast.success("Asset registered");
      setForm({ name: "", type: "road", location: "", block: "" });
      setShowForm(false);
      await load();
      setSelectedId(asset._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register asset");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-secondary">
        Loading assets...
      </div>
    );
  }

  return (
    <div className="space-y-6" data-tour="assets-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/maintenance")}
            className="rounded-control p-2 hover:bg-surface-muted"
            title="Back to work orders"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-h1 font-bold text-primary" data-tour="assets-heading">
              Asset Registry
            </h1>
            <p className="mt-1 text-body text-secondary">
              Society assets — select one to view its full maintenance history.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            data-tour="assets-refresh"
            onClick={load}
            className="flex items-center gap-2 rounded-control border border-border-strong px-4 py-2 text-body"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            data-tour="assets-register"
            onClick={() => setShowForm((value) => !value)}
            className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
          >
            <Plus className="h-4 w-4" /> Register asset
          </button>
        </div>
      </div>

      {showForm && (
        <form
          data-tour="assets-form"
          onSubmit={submit}
          className="grid grid-cols-1 gap-4 rounded-card border border-gold bg-gold-soft/40 p-5 md:grid-cols-4"
        >
          <label className="block text-body font-medium text-primary">
            Name
            <input
              required
              name="name"
              value={form.name}
              onChange={change}
              placeholder="e.g. Street light — Main Blvd"
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            />
          </label>
          <label className="block text-body font-medium text-primary">
            Type
            <select
              name="type"
              value={form.type}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            >
              {ASSET_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="block text-body font-medium text-primary">
            Location
            <input
              name="location"
              value={form.location}
              onChange={change}
              placeholder="e.g. Block A, Main Blvd"
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            />
          </label>
          <label className="block text-body font-medium text-primary">
            Block (optional)
            <select
              name="block"
              value={form.block}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            >
              <option value="">No block</option>
              {blocks.map((block) => (
                <option key={block._id} value={block._id}>
                  {block.name}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-4">
            <button
              disabled={saving}
              className="rounded-control bg-accent px-5 py-2 text-body font-medium text-on-accent disabled:opacity-50"
            >
              {saving ? "Saving..." : "Register asset"}
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3" data-tour="assets-filter">
        <label className="flex items-center gap-2 text-body text-secondary">
          Type
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-control border border-border-strong px-3 py-1.5 text-body"
          >
            <option value="">All</option>
            {ASSET_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Asset registry */}
        <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-none" data-tour="assets-list">
          <table className="min-w-full text-left text-body">
            <thead className="border-b border-border bg-canvas text-small tracking-wide text-secondary">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assets.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-muted"
                  >
                    No assets registered yet.
                  </td>
                </tr>
              )}
              {assets.map((asset) => (
                <tr
                  key={asset._id}
                  onClick={() => setSelectedId(asset._id)}
                  className={`cursor-pointer ${
                    selectedId === asset._id
                      ? "bg-gold-soft"
                      : "hover:bg-canvas"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-primary">
                    {asset.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-small font-medium text-secondary">
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {asset.location || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Maintenance history */}
        <section className="rounded-card border border-border bg-surface p-5 shadow-none" data-tour="assets-history">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-primary">
            <Wrench className="h-4 w-4" /> Maintenance History
          </h2>
          {!selectedId && (
            <p className="text-body text-muted">
              Select an asset to view its maintenance history.
            </p>
          )}
          {selectedId && historyLoading && (
            <p className="text-body text-secondary">Loading history...</p>
          )}
          {selectedId && !historyLoading && history && (
            <div className="space-y-4">
              <div>
                <h3 className="text-h2 font-semibold text-primary">
                  {history.asset.name}
                </h3>
                <p className="text-body text-secondary">
                  {history.asset.type} ·{" "}
                  {history.asset.location || "no location"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-body md:grid-cols-4">
                <div className="rounded-control bg-canvas p-3">
                  <p className="text-small text-secondary">Total jobs</p>
                  <p className="text-h2 font-semibold text-primary">
                    {history.summary.total}
                  </p>
                </div>
                <div className="rounded-control bg-warning-soft p-3">
                  <p className="text-small text-warning">Open</p>
                  <p className="text-h2 font-semibold text-warning">
                    {history.summary.open}
                  </p>
                </div>
                <div className="rounded-control bg-success-soft p-3">
                  <p className="text-small text-success">Completed</p>
                  <p className="text-h2 font-semibold text-success">
                    {history.summary.byStatus.Completed}
                  </p>
                </div>
                <div className="rounded-control bg-canvas p-3">
                  <p className="text-small text-secondary">Total cost</p>
                  <p className="text-h2 font-semibold text-primary">
                    {history.summary.totalCost}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {history.workOrders.length === 0 && (
                  <p className="text-body text-muted">
                    No work orders raised for this asset yet.
                  </p>
                )}
                {history.workOrders.map((workOrder) => (
                  <div
                    key={workOrder._id}
                    className="cursor-pointer rounded-control border border-border p-3 transition-colors duration-base hover:border-gold"
                    onClick={() => navigate(`/maintenance/${workOrder._id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-body font-medium text-primary">
                        {workOrder.description}
                      </p>
                      <StatusPill status={workOrder.status} />
                    </div>
                    <p className="mt-1 text-small text-secondary">
                      {workOrder.priority} ·{" "}
                      {workOrder.assignedStaffRef?.name ||
                        workOrder.contractor ||
                        "Unassigned"}{" "}
                      · {new Date(workOrder.createdAt).toLocaleDateString()}
                      {workOrder.completedAt &&
                        ` → done ${new Date(workOrder.completedAt).toLocaleDateString()}`}
                    </p>
                    {workOrder.completionNote && (
                      <p className="mt-1 text-small text-secondary">
                        {workOrder.completionNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

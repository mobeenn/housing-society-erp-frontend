import { useState } from "react";
import { Eye, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Table from "@/components/common/Table";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatusPill from "@/components/ui/StatusPill";
import { deletePlot, getPlots, PLOT_STATUSES } from "./propertiesApi";

export default function PlotsListPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    block: "",
    street: "",
    category: "",
    status: "",
  });
  const [confirm, setConfirm] = useState({
    isOpen: false,
    plot: null,
    loading: false,
  });

  const updateFilter = (name, value) =>
    setFilters((current) => ({ ...current, [name]: value }));
  const removePlot = async () => {
    setConfirm((current) => ({ ...current, loading: true }));
    try {
      await deletePlot(confirm.plot._id);
      toast.success("Plot deleted successfully");
      setConfirm({ isOpen: false, plot: null, loading: false });
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete plot");
      setConfirm((current) => ({ ...current, loading: false }));
    }
  };

  const columns = [
    {
      key: "plotNumber",
      label: "Plot",
      render: (row) => (
        <span className="font-mono font-semibold text-accent">
          {row.plotNumber}
        </span>
      ),
    },
    {
      key: "block",
      label: "Block",
      render: (row) => row.blockRef?.name || "—",
    },
    {
      key: "street",
      label: "Street",
      render: (row) => row.streetRef?.name || "—",
    },
    { key: "size", label: "Size" },
    {
      key: "currentOwner",
      label: "Owner",
      render: (row) => row.currentOwnerRef?.name || "Unassigned",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div data-tour="plots-status" className="flex flex-wrap items-center gap-2">
          <StatusPill status={row.status} />
          {row.isBlocked && <span className="rounded-full bg-danger-soft px-2 py-0.5 text-small font-semibold text-danger">Recovery blocked</span>}
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (row) => Number(row.price || 0).toLocaleString(),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div
          data-tour="plots-row-actions"
          className="flex items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className="p-1 text-accent hover:bg-gold-soft rounded-control"
            title="View plot"
            onClick={() => navigate(`/plots/${row._id}`)}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="p-1 text-success hover:bg-success-soft rounded-control"
            title="Edit plot"
            onClick={() => navigate(`/plots/${row._id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            className="p-1 text-danger hover:bg-danger-soft rounded-control"
            title="Delete plot"
            onClick={() =>
              setConfirm({ isOpen: true, plot: row, loading: false })
            }
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div data-tour="plots-page-intro" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-primary">Plots / Units</h1>
          <p className="mt-1 text-body text-secondary">
            Manage inventory, allocation, and ownership lifecycle.
          </p>
        </div>
        <button
          data-tour="plots-add"
          onClick={() => navigate("/plots/new")}
          className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent hover:bg-accent"
        >
          <Plus className="h-4 w-4" /> Add Plot
        </button>
      </div>

      <div data-tour="plots-filters" className="grid grid-cols-1 gap-3 rounded-card border border-border bg-surface p-4 shadow-none md:grid-cols-4">
        {[
          { name: "block", label: "Block" },
          { name: "street", label: "Street" },
          { name: "category", label: "Category" },
        ].map((filter) => (
          <input
            key={filter.name}
            value={filters[filter.name]}
            onChange={(event) => updateFilter(filter.name, event.target.value)}
            placeholder={`Filter by ${filter.label.toLowerCase()} ID`}
            className="rounded-control border border-border-strong px-3 py-2 text-body"
          />
        ))}
        <select
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
          className="rounded-control border border-border-strong px-3 py-2 text-body"
        >
          <option value="">All statuses</option>
          {PLOT_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        fetchFn={getPlots}
        filters={{ ...filters, refreshKey }}
        searchPlaceholder="Search by plot, owner, or file number..."
        onRowClick={(row) => navigate(`/plots/${row._id}`)}
      />
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={() =>
          setConfirm({ isOpen: false, plot: null, loading: false })
        }
        onConfirm={removePlot}
        title="Delete Plot"
        message={`Delete ${confirm.plot?.plotNumber}? This cannot be undone.`}
        confirmText="Delete Plot"
        variant="danger"
        loading={confirm.loading}
      />
    </div>
  );
}

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
        <span className="font-mono font-semibold text-primary-700">
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
          {row.isBlocked && <span className="rounded-full bg-danger-100 px-2 py-0.5 text-[10px] font-semibold text-danger-700">Recovery blocked</span>}
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
            className="p-1 text-primary-600 hover:bg-primary-50 rounded"
            title="View plot"
            onClick={() => navigate(`/plots/${row._id}`)}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="p-1 text-success-600 hover:bg-success-50 rounded"
            title="Edit plot"
            onClick={() => navigate(`/plots/${row._id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            className="p-1 text-danger-600 hover:bg-danger-50 rounded"
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
          <h1 className="text-2xl font-bold text-neutral-900">Plots / Units</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage inventory, allocation, and ownership lifecycle.
          </p>
        </div>
        <button
          data-tour="plots-add"
          onClick={() => navigate("/plots/new")}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" /> Add Plot
        </button>
      </div>

      <div data-tour="plots-filters" className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-4">
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
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        ))}
        <select
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
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

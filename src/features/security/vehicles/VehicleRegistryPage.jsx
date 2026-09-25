import { useCallback, useEffect, useState } from "react";
import { Car, Filter, Package, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import StatusPill from "@/components/ui/StatusPill";
import { getMembers } from "@/features/members/membersApi";
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  issueSticker,
  updateVehicle,
  updateVehicleStatus,
} from "../securityApi";

const VEHICLE_TYPES = ["Car", "Bike", "Van", "Truck", "SUV", "Other"];
const VEHICLE_STATUSES = ["Active", "Blocked", "Expired"];

export default function VehicleRegistryPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [savingVehicle, setSavingVehicle] = useState(false);

  const [showStickerModal, setShowStickerModal] = useState(false);
  const [stickerVehicle, setStickerVehicle] = useState(null);
  const [stickerNumber, setStickerNumber] = useState("");
  const [savingSticker, setSavingSticker] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusVehicle, setStatusVehicle] = useState(null);
  const [newStatus, setNewStatus] = useState("Active");
  const [savingStatus, setSavingStatus] = useState(false);

  // Form
  const [vehicleForm, setVehicleForm] = useState({
    owner: "",
    number: "",
    type: "Car",
    model: "",
    stickerNumber: "",
    status: "Active",
  });

  const loadVehicles = useCallback(() => {
    setLoading(true);
    const params = {};
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    if (search) params.q = search;

    return getVehicles(params)
      .then((res) => setVehicles(res.data || res || []))
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to load vehicles"),
      )
      .finally(() => setLoading(false));
  }, [typeFilter, statusFilter, search]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  useEffect(() => {
    getMembers({ page: 1, limit: 200 })
      .then((res) => setMembers(res.data || res.members || []))
      .catch(() => setMembers([]));
  }, []);

  const handleOpenVehicleModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleForm({
        owner: vehicle.owner || "",
        number: vehicle.number || "",
        type: vehicle.type || "Car",
        model: vehicle.model || "",
        stickerNumber: vehicle.stickerNumber || "",
        status: vehicle.status || "Active",
      });
    } else {
      setEditingVehicle(null);
      setVehicleForm({
        owner: "",
        number: "",
        type: "Car",
        model: "",
        stickerNumber: "",
        status: "Active",
      });
    }
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.number.trim()) {
      toast.error("Vehicle number is required");
      return;
    }
    setSavingVehicle(true);
    try {
      const payload = {
        owner: vehicleForm.owner || null,
        number: vehicleForm.number.trim(),
        type: vehicleForm.type,
        model: vehicleForm.model?.trim() || null,
        stickerNumber: vehicleForm.stickerNumber?.trim() || null,
        status: vehicleForm.status,
      };

      if (editingVehicle) {
        await updateVehicle(editingVehicle._id, payload);
        toast.success("Vehicle updated");
      } else {
        await createVehicle(payload);
        toast.success("Vehicle registered");
      }
      setShowVehicleModal(false);
      loadVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save vehicle");
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await deleteVehicle(id);
      toast.success("Vehicle deleted");
      loadVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const handleOpenStickerModal = (vehicle) => {
    setStickerVehicle(vehicle);
    setStickerNumber(vehicle.stickerNumber || "");
    setShowStickerModal(true);
  };

  const handleSaveSticker = async (e) => {
    e.preventDefault();
    if (!stickerNumber.trim()) {
      toast.error("Sticker number is required");
      return;
    }
    setSavingSticker(true);
    try {
      await issueSticker(stickerVehicle._id, stickerNumber.trim());
      toast.success("Sticker issued");
      setShowStickerModal(false);
      loadVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue sticker");
    } finally {
      setSavingSticker(false);
    }
  };

  const handleOpenStatusModal = (vehicle) => {
    setStatusVehicle(vehicle);
    setNewStatus(vehicle.status || "Active");
    setShowStatusModal(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    try {
      await updateVehicleStatus(statusVehicle._id, newStatus);
      toast.success("Vehicle status updated");
      setShowStatusModal(false);
      loadVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const stats = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "Active").length,
    blocked: vehicles.filter((v) => v.status === "Blocked").length,
    expired: vehicles.filter((v) => v.status === "Expired").length,
  };

  return (
    <div className="space-y-6" data-tour="vehicles-page">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1 font-bold tracking-tight text-primary" data-tour="vehicles-heading">
            Vehicle Registry
          </h1>
          <p className="text-body text-secondary">
            Register resident vehicles, issue stickers, and manage access status
          </p>
        </div>
        <button
          data-tour="vehicles-register"
          onClick={() => handleOpenVehicleModal()}
          className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent shadow-none hover:bg-accent transition-colors duration-base"
        >
          <Plus className="h-4 w-4" />
          Register Vehicle
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" data-tour="vehicles-stats">
        <div className="rounded-card border border-border bg-surface p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-control bg-surface-muted text-secondary">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-small font-medium text-secondary">Total Vehicles</p>
              <p className="text-h2 font-bold text-primary">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-control bg-success-soft text-success">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-small font-medium text-secondary">Active</p>
              <p className="text-h2 font-bold text-primary">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-control bg-danger-soft text-danger">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <p className="text-small font-medium text-secondary">Blocked</p>
              <p className="text-h2 font-bold text-primary">{stats.blocked}</p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-control bg-warning-soft text-warning">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-small font-medium text-secondary">Expired</p>
              <p className="text-h2 font-bold text-primary">{stats.expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-card border border-border bg-surface p-4 shadow-none" data-tour="vehicles-filters">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by number, model, sticker..."
            className="w-full rounded-control border border-border-strong pl-9 pr-3 py-2 text-body focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-control border border-border-strong px-3 py-2 text-body text-primary focus:border-accent focus:outline-none"
          >
            <option value="">All Types</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-control border border-border-strong px-3 py-2 text-body text-primary focus:border-accent focus:outline-none"
          >
            <option value="">All Statuses</option>
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-none" data-tour="vehicles-list">
        <table className="w-full text-left text-body">
          <thead className="border-b border-border bg-canvas text-small font-semibold text-secondary">
            <tr>
              <th className="p-4">Vehicle Number</th>
              <th className="p-4">Type</th>
              <th className="p-4">Model</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Sticker #</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">
                  Loading vehicles...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">
                  No vehicles registered yet.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle._id} className="hover:bg-canvas">
                  <td className="p-4">
                    <span className="font-mono font-semibold text-primary">
                      {vehicle.number}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-block rounded-full bg-surface-muted px-2.5 py-0.5 text-small font-medium text-primary">
                      {vehicle.type}
                    </span>
                  </td>
                  <td className="p-4 text-secondary">
                    {vehicle.model || "—"}
                  </td>
                  <td className="p-4 text-secondary">
                    {vehicle.ownerRef?.name || "No Owner"}
                  </td>
                  <td className="p-4">
                    {vehicle.stickerNumber ? (
                      <span className="font-mono text-small font-semibold text-accent">
                        {vehicle.stickerNumber}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenStickerModal(vehicle)}
                        className="text-small font-medium text-accent hover:text-accent underline"
                      >
                        Issue Sticker
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleOpenStatusModal(vehicle)}
                      className="cursor-pointer"
                    >
                      <StatusPill status={vehicle.status} />
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleOpenVehicleModal(vehicle)}
                        className="text-small font-medium text-accent hover:text-accent"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        className="text-small font-medium text-danger hover:text-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== MODAL: ADD / EDIT VEHICLE ==================== */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-overlay animate-in fade-in">
            <h2 className="text-h2 font-bold text-primary mb-4">
              {editingVehicle ? "Edit Vehicle" : "Register Vehicle"}
            </h2>
            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  value={vehicleForm.number}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, number: e.target.value })
                  }
                  required
                  placeholder="e.g. ABC-123 or LEA-1234"
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body font-mono focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Type *
                  </label>
                  <select
                    value={vehicleForm.type}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, type: e.target.value })
                    }
                    className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Status *
                  </label>
                  <select
                    value={vehicleForm.status}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, status: e.target.value })
                    }
                    className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                  >
                    {VEHICLE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={vehicleForm.model}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, model: e.target.value })
                  }
                  placeholder="e.g. Honda Civic, Yamaha YBR"
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Owner (Member)
                </label>
                <select
                  value={vehicleForm.owner}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, owner: e.target.value })
                  }
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                >
                  <option value="">None / Visitor</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} - {m.cnic || m.phone || m.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Sticker Number
                </label>
                <input
                  type="text"
                  value={vehicleForm.stickerNumber}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      stickerNumber: e.target.value,
                    })
                  }
                  placeholder="e.g. STK-001"
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="rounded-control border border-border-strong px-4 py-2 text-body font-medium text-primary hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVehicle}
                  className="rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent hover:bg-accent disabled:opacity-50"
                >
                  {savingVehicle
                    ? "Saving..."
                    : editingVehicle
                    ? "Update Vehicle"
                    : "Register Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ISSUE STICKER ==================== */}
      {showStickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="w-full max-w-sm rounded-card bg-surface p-6 shadow-overlay animate-in fade-in">
            <h2 className="text-h2 font-bold text-primary mb-2">
              Issue Sticker
            </h2>
            <p className="text-small text-secondary mb-4">
              Vehicle:{" "}
              <span className="font-mono font-semibold text-primary">
                {stickerVehicle?.number}
              </span>
            </p>
            <form onSubmit={handleSaveSticker} className="space-y-4">
              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Sticker Number *
                </label>
                <input
                  type="text"
                  value={stickerNumber}
                  onChange={(e) => setStickerNumber(e.target.value)}
                  required
                  placeholder="e.g. STK-001"
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStickerModal(false)}
                  className="rounded-control border border-border-strong px-3 py-1.5 text-body font-medium text-primary hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSticker}
                  className="rounded-control bg-accent px-4 py-1.5 text-body font-medium text-on-accent hover:bg-accent disabled:opacity-50"
                >
                  {savingSticker ? "Saving..." : "Issue Sticker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: UPDATE STATUS ==================== */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="w-full max-w-sm rounded-card bg-surface p-6 shadow-overlay animate-in fade-in">
            <h2 className="text-h2 font-bold text-primary mb-2">
              Update Vehicle Status
            </h2>
            <p className="text-small text-secondary mb-4">
              Vehicle:{" "}
              <span className="font-mono font-semibold text-primary">
                {statusVehicle?.number}
              </span>
            </p>
            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                >
                  {VEHICLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="rounded-control border border-border-strong px-3 py-1.5 text-body font-medium text-primary hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="rounded-control bg-accent px-4 py-1.5 text-body font-medium text-on-accent hover:bg-accent disabled:opacity-50"
                >
                  {savingStatus ? "Saving..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

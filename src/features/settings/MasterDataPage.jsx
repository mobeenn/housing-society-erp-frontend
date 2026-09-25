import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Archive,
  RotateCcw,
  Save,
  X,
  Loader2,
  Building,
  Route,
  LayoutGrid,
  Home,
  Briefcase,
  FileCheck,
} from "lucide-react";
import { administrationApi } from "./administrationApi";

const masterDataSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(1, "Code is required").max(10),
  description: z.string().optional().or(z.literal("")),
});

const MASTER_DATA_TYPES = [
  { key: "blocks", label: "Blocks / Sectors", icon: Building },
  { key: "streets", label: "Streets", icon: Route },
  { key: "plot-categories", label: "Plot Categories", icon: LayoutGrid },
  { key: "property-types", label: "Property Types", icon: Home },
  { key: "departments", label: "Departments", icon: Briefcase },
  { key: "noc-types", label: "NOC Types", icon: FileCheck },
];

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState("blocks");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(masterDataSchema),
  });

  useEffect(() => {
    loadData();
  }, [activeTab, showArchived]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await administrationApi.getMasterData(
        activeTab,
        showArchived,
      );
      setItems(data);
    } catch (error) {
      toast.error("Failed to load master data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    reset({ name: "", code: "", description: "" });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    reset({
      name: item.name,
      code: item.code,
      description: item.description || "",
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      if (editingItem) {
        await administrationApi.updateMasterData(
          activeTab,
          editingItem._id,
          data,
        );
        toast.success("Item updated successfully");
      } else {
        await administrationApi.createMasterData(activeTab, data);
        toast.success("Item created successfully");
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (item) => {
    if (!confirm(`Archive "${item.name}"? It can be restored later.`)) return;
    try {
      await administrationApi.archiveMasterData(activeTab, item._id);
      toast.success("Item archived successfully");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to archive item");
    }
  };

  const handleRestore = async (item) => {
    try {
      await administrationApi.restoreMasterData(activeTab, item._id);
      toast.success("Item restored successfully");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to restore item");
    }
  };

  const activeType = MASTER_DATA_TYPES.find((t) => t.key === activeTab);
  const ActiveIcon = activeType?.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-primary">Master Data</h1>
          <p className="mt-1 text-body text-secondary">
            Manage blocks, streets, categories, property types, and departments.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
          Add {activeType?.label}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-6">
          {MASTER_DATA_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.key}
                onClick={() => setActiveTab(type.key)}
                className={`flex items-center gap-2 border-b-2 px-1 py-3 text-body font-medium transition-colors ${
                  activeTab === type.key
                    ? "border-accent text-accent"
                    : "border-transparent text-secondary hover:border-border-strong hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Show Archived Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showArchived"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          className="h-4 w-4 rounded-control border-border-strong text-accent focus:ring-accent"
        />
        <label htmlFor="showArchived" className="text-body text-primary">
          Show archived items
        </label>
      </div>

      {/* Data Table */}
      <div className="rounded-card border border-border bg-surface shadow-none">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-secondary">
            <ActiveIcon className="mb-2 h-12 w-12 text-muted" />
            <p className="text-body">
              No {activeType?.label.toLowerCase()} found
            </p>
            <button
              onClick={handleAdd}
              className="mt-4 text-body font-medium text-accent hover:text-accent"
            >
              Add your first {activeType?.label.toLowerCase()}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body">
              <thead className="border-b border-border bg-canvas text-small font-semibold text-secondary">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className={item.isActive ? "" : "bg-canvas opacity-60"}
                  >
                    <td className="px-6 py-4 font-medium text-primary">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-control bg-surface-muted px-2.5 py-1 text-small font-semibold text-primary">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary">
                      {item.description || (
                        <span className="italic text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-small font-medium text-success">
                          <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-small font-medium text-secondary">
                          <Archive className="h-3 w-3" />
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.isActive ? (
                          <>
                            <button
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-1 rounded-control p-1.5 text-secondary hover:bg-surface-muted hover:text-primary"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleArchive(item)}
                              className="inline-flex items-center gap-1 rounded-control p-1.5 text-secondary hover:bg-surface-muted hover:text-danger"
                              title="Archive"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(item)}
                            className="inline-flex items-center gap-1 rounded-control p-1.5 text-secondary hover:bg-surface-muted hover:text-success"
                            title="Restore"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-overlay">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-h2 font-semibold text-primary">
                {editingItem ? "Edit" : "Add"} {activeType?.label}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-control p-1 text-muted hover:bg-surface-muted hover:text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-body font-medium text-primary">
                  Name *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder={`e.g. ${activeTab === "blocks" ? "Block A" : activeTab === "streets" ? "Main Boulevard" : "Residential"}`}
                />
                {errors.name && (
                  <p className="mt-1 text-small text-danger">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-body font-medium text-primary">
                  Code *
                </label>
                <input
                  type="text"
                  {...register("code")}
                  className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder={`e.g. ${activeTab === "blocks" ? "A" : activeTab === "streets" ? "MB" : "RES"}`}
                />
                {errors.code && (
                  <p className="mt-1 text-small text-danger">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-body font-medium text-primary">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-control border border-border-strong px-4 py-2 text-body font-medium text-primary hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent hover:bg-accent disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

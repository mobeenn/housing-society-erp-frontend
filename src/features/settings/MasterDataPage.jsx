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
          <h1 className="text-2xl font-bold text-neutral-900">Master Data</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage blocks, streets, categories, property types, and departments.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add {activeType?.label}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex gap-6">
          {MASTER_DATA_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.key}
                onClick={() => setActiveTab(type.key)}
                className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === type.key
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
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
          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="showArchived" className="text-sm text-neutral-700">
          Show archived items
        </label>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-neutral-500">
            <ActiveIcon className="mb-2 h-12 w-12 text-neutral-300" />
            <p className="text-sm">
              No {activeType?.label.toLowerCase()} found
            </p>
            <button
              onClick={handleAdd}
              className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Add your first {activeType?.label.toLowerCase()}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase text-neutral-600">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className={item.isActive ? "" : "bg-neutral-50 opacity-60"}
                  >
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {item.description || (
                        <span className="italic text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-success-600"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
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
                              className="inline-flex items-center gap-1 rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleArchive(item)}
                              className="inline-flex items-center gap-1 rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-danger-600"
                              title="Archive"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(item)}
                            className="inline-flex items-center gap-1 rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-success-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                {editingItem ? "Edit" : "Add"} {activeType?.label}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Name *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder={`e.g. ${activeTab === "blocks" ? "Block A" : activeTab === "streets" ? "Main Boulevard" : "Residential"}`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Code *
                </label>
                <input
                  type="text"
                  {...register("code")}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder={`e.g. ${activeTab === "blocks" ? "A" : activeTab === "streets" ? "MB" : "RES"}`}
                />
                {errors.code && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
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

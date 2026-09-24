import { useEffect, useState } from "react";
import { ArrowLeft, Link2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getComplaint } from "@/features/complaints/complaintsApi";
import { getUsers } from "@/features/users-roles/usersRolesApi";
import { createWorkOrder, getAssets } from "./maintenanceApi";

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function WorkOrderFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const complaintId = searchParams.get("complaint"); // set when opened from a complaint detail page
  const assetId = searchParams.get("asset");

  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaint, setComplaint] = useState(null);
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState([{ item: "", quantity: "" }]);
  const [form, setForm] = useState({
    asset: assetId || "",
    description: "",
    assignedStaff: "",
    contractor: "",
    priority: "Medium",
    expectedCompletion: "",
    laborCost: "",
    materialCost: "",
  });

  useEffect(() => {
    Promise.all([getAssets({}), getUsers({ page: 1, limit: 100 })])
      .then(([assetResult, userResult]) => {
        setAssets(assetResult.data || assetResult || []);
        setUsers(userResult.users || userResult.data || []);
      })
      .catch((error) =>
        toast.error(
          error.response?.data?.message || "Failed to load work order options",
        ),
      );

    if (complaintId) {
      getComplaint(complaintId)
        .then((data) => {
          setComplaint(data);
          setForm((current) => ({
            ...current,
            description:
              current.description ||
              `[${data.complaintNumber || "Complaint"}] ${data.description}`,
          }));
        })
        .catch(() => toast.error("Failed to load linked complaint"));
    }
  }, [complaintId]);

  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const changeMaterial = (index, field, value) =>
    setMaterials((current) =>
      current.map((material, i) =>
        i === index ? { ...material, [field]: value } : material,
      ),
    );

  const addMaterial = () =>
    setMaterials((current) => [...current, { item: "", quantity: "" }]);

  const removeMaterial = (index) =>
    setMaterials((current) => current.filter((_, i) => i !== index));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const workOrder = await createWorkOrder({
        asset: form.asset || null,
        relatedComplaint: complaintId || null,
        description: form.description,
        assignedStaff: form.assignedStaff || null,
        contractor: form.contractor || null,
        priority: form.priority,
        expectedCompletion: form.expectedCompletion || null,
        materials: materials
          .filter((material) => material.item.trim())
          .map((material) => ({
            item: material.item.trim(),
            quantity: Number(material.quantity) || 0,
          })),
        laborCost: Number(form.laborCost) || 0,
        materialCost: Number(form.materialCost) || 0,
      });
      toast.success("Work order created");
      navigate(`/maintenance/${workOrder._id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create work order",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6" data-tour="maintenance-form-page">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/maintenance")}
          className="rounded-lg p-2 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            New Work Order
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Schedule maintenance against an asset, or track a repair spawned
            from a complaint.
          </p>
        </div>
      </div>

      {complaint && (
        <div className="flex items-start gap-2 rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-800">
          <Link2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Linked to complaint{" "}
            <button
              type="button"
              onClick={() => navigate(`/complaints/${complaintId}`)}
              className="font-semibold underline"
            >
              {complaint.complaintNumber || complaint.category}
            </button>{" "}
            ({complaint.status}) — {complaint.location || "no location"}
          </span>
        </div>
      )}

      <form
        data-tour="maintenance-form"
        onSubmit={submit}
        className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-neutral-700">
            Asset (optional — leave empty for general work)
            <select
              name="asset"
              value={form.asset}
              onChange={change}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
            >
              <option value="">No specific asset</option>
              {assets.map((asset) => (
                <option key={asset._id} value={asset._id}>
                  {asset.name} ({asset.type})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-neutral-700">
            Priority
            <select
              name="priority"
              value={form.priority}
              onChange={change}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-neutral-700">
            Assigned staff
            <select
              name="assignedStaff"
              value={form.assignedStaff}
              onChange={change}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-neutral-700">
            Contractor (external, optional)
            <input
              name="contractor"
              value={form.contractor}
              onChange={change}
              placeholder="e.g. Al-Noor Builders"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
            />
          </label>
          <label className="block text-sm font-medium text-neutral-700">
            Expected completion
            <input
              type="date"
              name="expectedCompletion"
              value={form.expectedCompletion}
              onChange={change}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-neutral-700">
              Labor cost
              <input
                type="number"
                min="0"
                step="0.01"
                name="laborCost"
                value={form.laborCost}
                onChange={change}
                placeholder="0"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Material cost
              <input
                type="number"
                min="0"
                step="0.01"
                name="materialCost"
                value={form.materialCost}
                onChange={change}
                placeholder="0"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              />
            </label>
          </div>
        </div>

        <label className="block text-sm font-medium text-neutral-700">
          Description
          <textarea
            required
            name="description"
            value={form.description}
            onChange={change}
            rows={4}
            placeholder="Describe the maintenance work..."
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
          />
        </label>

        <div data-tour="maintenance-materials">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">
              Materials
            </span>
            <button
              type="button"
              onClick={addMaterial}
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              + Add item
            </button>
          </div>
          <div className="space-y-2">
            {materials.map((material, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={material.item}
                  onChange={(event) =>
                    changeMaterial(index, "item", event.target.value)
                  }
                  placeholder="Item (e.g. PVC pipe 4 inch)"
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min="0"
                  value={material.quantity}
                  onChange={(event) =>
                    changeMaterial(index, "quantity", event.target.value)
                  }
                  placeholder="Qty"
                  className="w-28 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
                {materials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="rounded-lg border border-neutral-300 px-3 text-sm text-neutral-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
          <button
            type="button"
            onClick={() => navigate("/maintenance")}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            data-tour="maintenance-submit"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create work order"}
          </button>
        </div>
      </form>
    </div>
  );
}

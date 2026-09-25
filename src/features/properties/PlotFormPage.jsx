import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { administrationApi } from "@/features/settings/administrationApi";
import { getMembers } from "@/features/members/membersApi";
import {
  createPlot,
  getPlotById,
  PLOT_STATUSES,
  updatePlot,
} from "./propertiesApi";

const emptyForm = {
  block: "",
  street: "",
  size: "",
  category: "",
  propertyType: "",
  fileNumber: "",
  location: "",
  currentOwner: "",
  status: "Available",
  price: "",
};

export default function PlotFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [refs, setRefs] = useState({
    blocks: [],
    streets: [],
    categories: [],
    propertyTypes: [],
    members: [],
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [blocks, streets, categories, propertyTypes, members, plot] =
          await Promise.all([
            administrationApi.getMasterData("blocks"),
            administrationApi.getMasterData("streets"),
            administrationApi.getMasterData("plot-categories"),
            administrationApi.getMasterData("property-types"),
            getMembers({ page: 1, limit: 1000 }),
            isEdit ? getPlotById(id) : Promise.resolve(null),
          ]);
        setRefs({
          blocks,
          streets,
          categories,
          propertyTypes,
          members: members.data || [],
        });
        if (plot)
          setForm({
            ...emptyForm,
            ...plot,
            price: plot.price ?? "",
            currentOwner: plot.currentOwner || "",
          });
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load plot references",
        );
        if (isEdit) navigate("/plots");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        currentOwner: form.currentOwner || null,
      };
      if (isEdit) await updatePlot(id, payload);
      else await createPlot(payload);
      toast.success(
        isEdit ? "Plot updated successfully" : "Plot created successfully",
      );
      navigate("/plots");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save plot");
    } finally {
      setSaving(false);
    }
  };
  const selectFields = [
    { name: "block", label: "Block", options: refs.blocks },
    { name: "street", label: "Street", options: refs.streets },
    { name: "category", label: "Plot category", options: refs.categories },
    {
      name: "propertyType",
      label: "Property type",
      options: refs.propertyTypes,
    },
  ];
  if (loading)
    return (
      <div className="py-16 text-center text-secondary">Loading plot...</div>
    );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/plots")}
          className="rounded-control p-2 hover:bg-surface-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-h1 font-bold text-primary">
            {isEdit ? "Edit Plot" : "Add Plot"}
          </h1>
          <p className="mt-1 text-body text-secondary">
            Capture the plot record and its current allocation.
          </p>
        </div>
      </div>
      <form
        onSubmit={save}
        className="space-y-6 rounded-card border border-border bg-surface p-6 shadow-none"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {selectFields.map((field) => (
            <label
              key={field.name}
              className="text-body font-medium text-primary"
            >
              {field.label} *
              <select
                required
                name={field.name}
                value={form[field.name]}
                onChange={change}
                className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
              >
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.name}
                    {option.code ? ` (${option.code})` : ""}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="text-body font-medium text-primary">
            Size *
            <input
              required
              name="size"
              value={form.size}
              onChange={change}
              placeholder="e.g. 5 Marla"
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            />
          </label>
          <label className="text-body font-medium text-primary">
            Price *
            <input
              required
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            />
          </label>
          <label className="text-body font-medium text-primary">
            File number
            <input
              name="fileNumber"
              value={form.fileNumber}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            />
          </label>
          <label className="text-body font-medium text-primary">
            Location
            <input
              name="location"
              value={form.location}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            />
          </label>
          <label className="text-body font-medium text-primary">
            Current owner
            <select
              name="currentOwner"
              value={form.currentOwner}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            >
              <option value="">Unassigned</option>
              {refs.members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.memberId})
                </option>
              ))}
            </select>
          </label>
          <label className="text-body font-medium text-primary">
            Status
            <select
              name="status"
              value={form.status}
              onChange={change}
              disabled={!isEdit}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            >
              {PLOT_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => navigate("/plots")}
            className="rounded-control border border-border-strong px-4 py-2 text-body"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="rounded-control bg-accent px-5 py-2 text-body font-medium text-on-accent disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Update Plot" : "Create Plot"}
          </button>
        </div>
      </form>
    </div>
  );
}

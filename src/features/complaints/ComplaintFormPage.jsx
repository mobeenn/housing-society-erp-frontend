import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getMembers } from "@/features/members/membersApi";
import { getPlots } from "@/features/properties/propertiesApi";
import { createComplaint } from "./complaintsApi";

const CATEGORIES = [
  "Sanitation",
  "Electricity",
  "Water & Sewerage",
  "Roads & Infrastructure",
  "Security",
  "Noise",
  "Other",
];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function ComplaintFormPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [plots, setPlots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    member: "",
    plot: "",
    category: "Sanitation",
    priority: "Medium",
    location: "",
    description: "",
    attachments: "",
  });

  useEffect(() => {
    Promise.all([
      getMembers({ page: 1, limit: 100 }),
      getPlots({ page: 1, limit: 100 }),
    ])
      .then(([memberResult, plotResult]) => {
        setMembers(memberResult.data || []);
        setPlots(plotResult.data || []);
      })
      .catch((error) =>
        toast.error(
          error.response?.data?.message || "Failed to load complaint options",
        ),
      );
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
      const complaint = await createComplaint({
        member: form.member,
        plot: form.plot || null, // plot is nullable — common-area complaints have none
        category: form.category,
        priority: form.priority,
        location: form.location,
        description: form.description,
        attachments: form.attachments
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      toast.success("Complaint filed");
      navigate(`/complaints/${complaint._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to file complaint");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6" data-tour="complaints-form-page">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/complaints")}
          className="rounded-control p-2 hover:bg-surface-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-h1 font-bold text-primary">
            File a Complaint
          </h1>
          <p className="mt-1 text-body text-secondary">
            An SLA deadline is computed automatically from category and
            priority.
          </p>
        </div>
      </div>
      <form
        data-tour="complaints-form"
        onSubmit={submit}
        className="space-y-5 rounded-card border border-border bg-surface p-6 shadow-none"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-body font-medium text-primary">
            Member
            <select
              required
              name="member"
              value={form.member}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.memberId})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-body font-medium text-primary">
            Plot (optional — leave empty for common areas)
            <select
              name="plot"
              value={form.plot}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            >
              <option value="">Common area / no plot</option>
              {plots.map((plot) => (
                <option key={plot._id} value={plot._id}>
                  {plot.plotNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-body font-medium text-primary">
            Category
            <select
              name="category"
              value={form.category}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            >
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="block text-body font-medium text-primary">
            Priority
            <select
              name="priority"
              value={form.priority}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-body font-medium text-primary">
          Location
          <input
            name="location"
            value={form.location}
            onChange={change}
            placeholder="e.g. Block B, Street 4, near park gate"
            className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
          />
        </label>
        <label className="block text-body font-medium text-primary">
          Description
          <textarea
            required
            name="description"
            value={form.description}
            onChange={change}
            rows={4}
            placeholder="Describe the issue..."
            className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
          />
        </label>
        <label className="block text-body font-medium text-primary">
          Attachments (document IDs, comma separated)
          <input
            name="attachments"
            value={form.attachments}
            onChange={change}
            placeholder="DOC-1, DOC-2"
            className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
          />
        </label>
        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => navigate("/complaints")}
            className="rounded-control border border-border-strong px-4 py-2 text-body"
          >
            Cancel
          </button>
          <button
            data-tour="complaints-submit"
            disabled={saving}
            className="rounded-control bg-accent px-5 py-2 text-body font-medium text-on-accent disabled:opacity-50"
          >
            {saving ? "Submitting..." : "File complaint"}
          </button>
        </div>
      </form>
    </div>
  );
}

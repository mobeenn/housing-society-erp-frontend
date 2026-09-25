import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getMembers } from "@/features/members/membersApi";
import { getPlots } from "@/features/properties/propertiesApi";
import { createNoc, NOC_TYPES } from "./nocsApi";

export default function NocApplicationPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [plots, setPlots] = useState([]);
  const [form, setForm] = useState({
    member: "",
    plot: "",
    nocType: "Transfer",
    feeAmount: "0",
    documents: [],
  });
  const [saving, setSaving] = useState(false);
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
          error.response?.data?.message || "Failed to load NOC options",
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
      const noc = await createNoc({
        ...form,
        feeAmount: Number(form.feeAmount),
      });
      toast.success("NOC application created");
      navigate(`/nocs/${noc._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create NOC");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="max-w-3xl space-y-6" data-tour="nocs-request-page">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/nocs")}
          className="rounded-control p-2 hover:bg-surface-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-h1 font-bold text-primary">
            NOC Application
          </h1>
          <p className="mt-1 text-body text-secondary">
            Apply for a clearance certificate and follow its verification
            stages.
          </p>
        </div>
      </div>
      <form
        data-tour="nocs-request-form"
        onSubmit={submit}
        className="space-y-5 rounded-card border border-border bg-surface p-6 shadow-none"
      >
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
          Plot
          <select
            required
            name="plot"
            value={form.plot}
            onChange={change}
            className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
          >
            <option value="">Select plot</option>
            {plots.map((plot) => (
              <option key={plot._id} value={plot._id}>
                {plot.plotNumber} · {plot.currentOwnerRef?.name || "Unassigned"}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-body font-medium text-primary">
            NOC type
            <select
              name="nocType"
              value={form.nocType}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            >
              {NOC_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="text-body font-medium text-primary">
            Fee amount
            <input
              type="number"
              min="0"
              name="feeAmount"
              value={form.feeAmount}
              onChange={change}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => navigate("/nocs")}
            className="rounded-control border border-border-strong px-4 py-2 text-body"
          >
            Cancel
          </button>
          <button
            data-tour="nocs-submit"
            disabled={saving}
            className="rounded-control bg-accent px-5 py-2 text-body font-medium text-on-accent disabled:opacity-50"
          >
            {saving ? "Submitting..." : "Submit application"}
          </button>
        </div>
      </form>
    </div>
  );
}

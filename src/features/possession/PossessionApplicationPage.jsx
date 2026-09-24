import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getMembers } from "@/features/members/membersApi";
import { getPlots } from "@/features/properties/propertiesApi";
import { createPossession } from "./possessionApi";
export default function PossessionApplicationPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [plots, setPlots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    member: "",
    plot: "",
    possessionCharges: "0",
    electricity: "",
    gas: "",
    water: "",
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
          error.response?.data?.message || "Failed to load possession options",
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
      const app = await createPossession({
        member: form.member,
        plot: form.plot,
        possessionCharges: Number(form.possessionCharges),
        utilities: {
          electricity: form.electricity || null,
          gas: form.gas || null,
          water: form.water || null,
        },
      });
      toast.success("Possession application created");
      navigate(`/possession/${app._id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create possession application",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="max-w-3xl space-y-6" data-tour="possession-request-page">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/possession")}
          className="rounded-lg p-2 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Possession Application
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Verify eligibility, clear charges, and prepare handover.
          </p>
        </div>
      </div>
      <form
        data-tour="possession-request-form"
        onSubmit={submit}
        className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <label className="block text-sm font-medium text-neutral-700">
          Member
          <select
            required
            name="member"
            value={form.member}
            onChange={change}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
          >
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.memberId})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-neutral-700">
          Plot
          <select
            required
            name="plot"
            value={form.plot}
            onChange={change}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
          >
            <option value="">Select plot</option>
            {plots.map((plot) => (
              <option key={plot._id} value={plot._id}>
                {plot.plotNumber} · {plot.currentOwnerRef?.name || "Unassigned"}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-neutral-700">
          Possession charges
          <input
            required
            min="0"
            type="number"
            name="possessionCharges"
            value={form.possessionCharges}
            onChange={change}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["electricity", "Electricity meter"],
            ["gas", "Gas meter"],
            ["water", "Water meter"],
          ].map(([name, label]) => (
            <label key={name} className="text-sm font-medium text-neutral-700">
              {label}
              <input
                name={name}
                value={form[name]}
                onChange={change}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              />
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
          <button
            type="button"
            onClick={() => navigate("/possession")}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            data-tour="possession-submit"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Submitting..." : "Submit application"}
          </button>
        </div>
      </form>
    </div>
  );
}

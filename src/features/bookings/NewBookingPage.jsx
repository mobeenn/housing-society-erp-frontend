import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calculator } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getMembers } from "@/features/members/membersApi";
import { getPlots } from "@/features/properties/propertiesApi";
import { createBooking } from "./bookingsApi";

const initialForm = {
  member: "",
  plot: "",
  price: "",
  discount: "0",
  developmentCharges: "0",
  additionalCharges: "0",
  bookingAmount: "0",
  numberOfInstallments: "12",
  frequency: "monthly",
  firstDueDate: new Date().toISOString().slice(0, 10),
};
const money = (value) => Number(value || 0);

export default function NewBookingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [members, setMembers] = useState([]);
  const [plots, setPlots] = useState([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [plotQuery, setPlotQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getMembers({ page: 1, limit: 100 }),
      getPlots({ page: 1, limit: 100, status: "Available" }),
    ])
      .then(([memberResult, plotResult]) => {
        setMembers(memberResult.data || []);
        setPlots(plotResult.data || []);
      })
      .catch((error) =>
        toast.error(
          error.response?.data?.message || "Failed to load booking options",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const selectedPlot = plots.find((plot) => plot._id === form.plot);
  const filteredMembers = members.filter((member) =>
    `${member.name} ${member.memberId}`
      .toLowerCase()
      .includes(memberQuery.toLowerCase()),
  );
  const filteredPlots = plots.filter((plot) =>
    `${plot.plotNumber} ${plot.fileNumber || ""} ${plot.size}`
      .toLowerCase()
      .includes(plotQuery.toLowerCase()),
  );
  const netPayable = useMemo(
    () =>
      money(form.price) -
      money(form.discount) +
      money(form.developmentCharges) +
      money(form.additionalCharges),
    [form],
  );
  const installmentTotal = Math.max(0, netPayable - money(form.bookingAmount));
  const installmentAmount = form.numberOfInstallments
    ? installmentTotal / Number(form.numberOfInstallments)
    : 0;
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const selectPlot = (event) => {
    const plot = plots.find((item) => item._id === event.target.value);
    setForm((current) => ({
      ...current,
      plot: event.target.value,
      price: plot?.price ?? current.price,
    }));
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createBooking({
        member: form.member,
        plot: form.plot,
        price: money(form.price),
        discount: money(form.discount),
        developmentCharges: money(form.developmentCharges),
        additionalCharges: money(form.additionalCharges),
        bookingAmount: money(form.bookingAmount),
        planTemplate: {
          numberOfInstallments: Number(form.numberOfInstallments),
          frequency: form.frequency,
          firstDueDate: new Date(form.firstDueDate).toISOString(),
        },
      });
      toast.success("Booking submitted for approval");
      navigate("/bookings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="py-16 text-center text-neutral-500">
        Loading members and available plots...
      </div>
    );
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/bookings")}
          className="rounded-lg p-2 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">New Booking</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Reserve an available plot and prepare its installment plan.
          </p>
        </div>
      </div>
      <form
        onSubmit={save}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]"
      >
        <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-neutral-700">
              Member *
              <input
                value={memberQuery}
                onChange={(event) => setMemberQuery(event.target.value)}
                placeholder="Search member name or ID"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              />
              <select
                required
                name="member"
                value={form.member}
                onChange={change}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              >
                <option value="">Select member</option>
                {filteredMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.memberId})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Available plot *
              <input
                value={plotQuery}
                onChange={(event) => setPlotQuery(event.target.value)}
                placeholder="Search plot or file number"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              />
              <select
                required
                name="plot"
                value={form.plot}
                onChange={selectPlot}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              >
                <option value="">Select plot</option>
                {filteredPlots.map((plot) => (
                  <option key={plot._id} value={plot._id}>
                    {plot.plotNumber} · {plot.size} ·{" "}
                    {Number(plot.price || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 border-t border-neutral-200 pt-5 md:grid-cols-2">
            {[
              ["price", "Price"],
              ["discount", "Discount"],
              ["developmentCharges", "Development charges"],
              ["additionalCharges", "Additional charges"],
              ["bookingAmount", "Booking amount"],
            ].map(([name, label]) => (
              <label
                key={name}
                className="text-sm font-medium text-neutral-700"
              >
                {label} *
                <input
                  required
                  type="number"
                  min="0"
                  name={name}
                  value={form[name]}
                  onChange={change}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
                />
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 border-t border-neutral-200 pt-5 md:grid-cols-3">
            <label className="text-sm font-medium text-neutral-700">
              Installments *
              <input
                required
                type="number"
                min="1"
                max="120"
                name="numberOfInstallments"
                value={form.numberOfInstallments}
                onChange={change}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Frequency
              <select
                name="frequency"
                value={form.frequency}
                onChange={change}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </label>
            <label className="text-sm font-medium text-neutral-700">
              First due date
              <input
                required
                type="date"
                name="firstDueDate"
                value={form.firstDueDate}
                onChange={change}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal"
              />
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              disabled={saving || !selectedPlot}
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Submitting..." : "Create Booking"}
            </button>
          </div>
        </div>
        <aside className="h-fit rounded-xl border border-primary-100 bg-primary-50 p-5">
          <div className="flex items-center gap-2 font-semibold text-primary-900">
            <Calculator className="h-4 w-4" /> Installment preview
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Selected plot</dt>
              <dd className="font-medium">{selectedPlot?.plotNumber || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Net payable</dt>
              <dd className="font-semibold">{netPayable.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">After booking amount</dt>
              <dd className="font-semibold">
                {installmentTotal.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between border-t border-primary-100 pt-3">
              <dt className="text-neutral-600">Each installment</dt>
              <dd className="font-semibold">
                {installmentAmount.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-primary-800">
            Final installment absorbs rounding so the schedule always totals the
            outstanding balance.
          </p>
        </aside>
      </form>
    </div>
  );
}

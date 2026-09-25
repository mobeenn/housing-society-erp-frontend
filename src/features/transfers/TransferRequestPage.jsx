import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  checkDuplicates,
  createMember,
  getMembers,
} from "@/features/members/membersApi";
import { getPlots } from "@/features/properties/propertiesApi";
import { createTransfer } from "./transfersApi";

const steps = [
  "Select plot",
  "Verify identity and dues",
  "New member",
  "Transfer fee",
  "Documents",
];
export default function TransferRequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [plots, setPlots] = useState([]);
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [recipientMode, setRecipientMode] = useState("existing");
  const [newMember, setNewMember] = useState({ name: "", cnic: "", phone: "" });
  const [form, setForm] = useState({
    plot: "",
    fromMember: "",
    toMember: "",
    type: "Sale",
    transferFee: "0",
    documents: [],
  });
  useEffect(() => {
    Promise.all([
      getPlots({ page: 1, limit: 100 }),
      getMembers({ page: 1, limit: 100 }),
    ])
      .then(([plotResult, memberResult]) => {
        setPlots(plotResult.data || []);
        setMembers(memberResult.data || []);
      })
      .catch((error) =>
        toast.error(
          error.response?.data?.message || "Failed to load transfer options",
        ),
      );
  }, []);
  const selectedPlot = plots.find((plot) => plot._id === form.plot);
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const changeNewMember = (event) =>
    setNewMember((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const selectPlot = (event) => {
    const plot = plots.find((item) => item._id === event.target.value);
    setForm((current) => ({
      ...current,
      plot: event.target.value,
      fromMember: plot?.currentOwner || "",
    }));
  };
  const submit = async () => {
    setSaving(true);
    try {
      const transfer = await createTransfer({
        ...form,
        transferFee: Number(form.transferFee),
      });
      toast.success("Transfer request created");
      navigate(`/transfers/${transfer._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create transfer");
    } finally {
      setSaving(false);
    }
  };
  const next = async () => {
    if (step === 0 && (!form.plot || !form.fromMember))
      return toast.error("Select a plot with a current owner");
    if (step === 2 && recipientMode === "existing" && !form.toMember)
      return toast.error("Select the new member");
    if (step === 2 && recipientMode === "new") {
      if (!newMember.name || !newMember.cnic)
        return toast.error("Name and CNIC are required");
      const duplicate = await checkDuplicates({
        cnic: newMember.cnic,
        phone: newMember.phone,
      });
      if (duplicate.hasDuplicates)
        return toast.error("A member with this CNIC or phone already exists");
      try {
        setSaving(true);
        const created = await createMember(newMember);
        setForm((current) => ({ ...current, toMember: created.member._id }));
        setMembers((current) => [...current, created.member]);
        setRecipientMode("existing");
      } catch (error) {
        return toast.error(
          error.response?.data?.message || "Failed to create member",
        );
      } finally {
        setSaving(false);
      }
    }
    if (step < steps.length - 1) setStep((value) => value + 1);
    else submit();
  };
  return (
    <div className="max-w-4xl space-y-6" data-tour="transfers-request-page">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/transfers")}
          className="rounded-control p-2 hover:bg-surface-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-h1 font-bold text-primary">
            New Transfer Request
          </h1>
          <p className="mt-1 text-body text-secondary">
            Complete each verification step before approval.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5" data-tour="transfers-request-steps">
        {steps.map((label, index) => (
          <div
            key={label}
            className={`rounded-control border p-3 text-small ${index === step ? "border-accent bg-gold-soft text-accent" : index < step ? "border-success bg-success-soft text-success" : "border-border text-secondary"}`}
          >
            <span className="font-semibold">{index + 1}. </span>
            {label}
          </div>
        ))}
      </div>
      <div className="rounded-card border border-border bg-surface p-6 shadow-none" data-tour="transfers-request-panel">
        {step === 0 && (
          <label className="block text-body font-medium text-primary">
            Plot with current owner
            <select
              required
              value={form.plot}
              onChange={selectPlot}
              className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
            >
              <option value="">Select plot</option>
              {plots
                .filter((plot) => plot.currentOwner)
                .map((plot) => (
                  <option key={plot._id} value={plot._id}>
                    {plot.plotNumber} ·{" "}
                    {plot.currentOwnerRef?.name || plot.currentOwner}
                  </option>
                ))}
            </select>
          </label>
        )}
        {step === 1 && (
          <div className="rounded-control bg-canvas p-5">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <Check className="h-4 w-4 text-success" /> Verification will
              check ownership, identity, outstanding dues, and restrictions.
            </div>
            <p className="mt-2 text-body text-secondary">
              Plot: {selectedPlot?.plotNumber || "—"} · Current owner:{" "}
              {selectedPlot?.currentOwnerRef?.name || form.fromMember || "—"}
            </p>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecipientMode("existing")}
                className={`rounded-control px-3 py-2 text-body ${recipientMode === "existing" ? "bg-accent text-on-accent" : "border border-border-strong"}`}
              >
                Existing member
              </button>
              <button
                type="button"
                onClick={() => setRecipientMode("new")}
                className={`rounded-control px-3 py-2 text-body ${recipientMode === "new" ? "bg-accent text-on-accent" : "border border-border-strong"}`}
              >
                New member
              </button>
            </div>
            {recipientMode === "existing" ? (
              <label className="block text-body font-medium text-primary">
                Transfer to member
                <select
                  required
                  name="toMember"
                  value={form.toMember}
                  onChange={change}
                  className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
                >
                  <option value="">Select member</option>
                  {members
                    .filter((member) => member._id !== form.fromMember)
                    .map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.memberId})
                      </option>
                    ))}
                </select>
              </label>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="text-body font-medium text-primary">
                  Name
                  <input
                    name="name"
                    value={newMember.name}
                    onChange={changeNewMember}
                    className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
                  />
                </label>
                <label className="text-body font-medium text-primary">
                  CNIC
                  <input
                    name="cnic"
                    value={newMember.cnic}
                    onChange={changeNewMember}
                    placeholder="12345-1234567-1"
                    className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
                  />
                </label>
                <label className="text-body font-medium text-primary">
                  Phone
                  <input
                    name="phone"
                    value={newMember.phone}
                    onChange={changeNewMember}
                    className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
                  />
                </label>
              </div>
            )}
          </div>
        )}
        {step === 3 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-body font-medium text-primary">
              Transfer type
              <select
                name="type"
                value={form.type}
                onChange={change}
                className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
              >
                <option>Sale</option>
                <option>Gift</option>
                <option>Inheritance</option>
                <option>Family transfer</option>
              </select>
            </label>
            <label className="text-body font-medium text-primary">
              Transfer fee
              <input
                type="number"
                min="0"
                name="transferFee"
                value={form.transferFee}
                onChange={change}
                className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 font-normal"
              />
            </label>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="font-semibold text-primary">Documents</h2>
            <p className="mt-2 text-body text-secondary">
              Documents can be attached to the request after creation from the
              transfer detail page.
            </p>
          </div>
        )}
        <div className="mt-6 flex justify-between border-t border-border pt-5">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
            className="rounded-control border border-border-strong px-4 py-2 text-body disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={next}
            className="rounded-control bg-accent px-5 py-2 text-body font-medium text-on-accent"
          >
            {step === steps.length - 1
              ? saving
                ? "Creating..."
                : "Submit request"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

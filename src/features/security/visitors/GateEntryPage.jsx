import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AlertTriangle, Car } from "lucide-react";
import AsyncMemberSelect from "@/components/common/AsyncMemberSelect";
import { Button, Card, FormGrid, Input } from "@/components/ui";
import { createVisitorEntry, listPasses } from "./visitorsApi";

const emptyForm = {
  visitorName: "",
  phone: "",
  cnic: "",
  hostMember: "",
  purpose: "",
  gate: "Main Gate",
  vehicleNumber: "",
  remarks: "",
  passId: "",
};

export default function GateEntryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passes, setPasses] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    listPasses({ status: "Active", limit: 100 })
      .then((result) => setPasses(Array.isArray(result?.data) ? result.data : []))
      .catch((error) => console.error("Failed to fetch passes:", error));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.visitorName.trim()) {
      toast.error("Visitor name is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        hostMember: formData.hostMember || null,
        passId: formData.passId || null,
        phone: formData.phone || null,
        cnic: formData.cnic || null,
        vehicleNumber: formData.vehicleNumber || null,
        remarks: formData.remarks || null,
      };
      const result = await createVisitorEntry(payload);
      if (result.data?.blacklistWarning) {
        toast.error(result.data.blacklistWarning, {
          duration: 6000,
          icon: <AlertTriangle className="text-warning" />,
        });
      } else {
        toast.success(result.message || "Visitor entry created");
      }
      setFormData(emptyForm);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6" data-tour="visitors-page">
      <div>
        <h1 className="text-h1 font-bold text-primary" data-tour="visitors-page-heading">
          Gate Entry
        </h1>
        <p className="mt-1 text-body text-secondary">Quick visitor entry form for security guards</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5" data-tour="visitors-form">
          <div data-tour="visitors-name">
            <Input
              label="Visitor name *"
              name="visitorName"
              value={formData.visitorName}
              onChange={handleChange}
              placeholder="Enter visitor name"
              required
            />
          </div>

          <FormGrid cols={2}>
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" />
            <Input label="CNIC" name="cnic" value={formData.cnic} onChange={handleChange} placeholder="XXXXX-XXXXXXX-X" />
          </FormGrid>

          <div data-tour="visitors-host">
            <label className="mb-1.5 block text-label text-secondary">Host member</label>
            <AsyncMemberSelect
              value={formData.hostMember}
              onChange={(memberId) => setFormData((prev) => ({ ...prev, hostMember: memberId || "" }))}
              emptyLabel="-- Select Host --"
              placeholder="Search host member…"
            />
          </div>

          <Input
            label="Purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            placeholder="e.g., Personal visit, Delivery, Contractor"
          />

          <FormGrid cols={2}>
            <Input label="Gate" name="gate" value={formData.gate} onChange={handleChange} placeholder="Gate name" />
            <div>
              <Input
                label="Vehicle number"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="ABC-123"
              />
              <p className="mt-1 flex items-center gap-1 text-small text-muted">
                <Car className="h-3.5 w-3.5" /> Optional
              </p>
            </div>
          </FormGrid>

          <div>
            <label className="mb-1.5 block text-label text-secondary">Pass (if any)</label>
            <select
              name="passId"
              value={formData.passId}
              onChange={handleChange}
              className="min-h-11 w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 text-body text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            >
              <option value="">-- No Pass --</option>
              {passes.map((pass) => (
                <option key={pass._id} value={pass._id}>
                  {pass.passNumber} - {pass.holderName} ({pass.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-label text-secondary">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 text-body text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              placeholder="Optional notes"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button data-tour="visitors-submit" type="submit" className="w-full sm:flex-1" isLoading={loading}>
              Log Entry
            </Button>
            <Button
              data-tour="visitors-active-link"
              type="button"
              variant="secondary"
              className="w-full sm:flex-1"
              onClick={() => navigate("/security/visitors/active")}
            >
              View Active
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

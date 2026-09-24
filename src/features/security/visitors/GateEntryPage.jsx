import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserCheck, Car, AlertTriangle } from "lucide-react";
import { createVisitorEntry } from "./visitorsApi";
import { listMembers } from "../../members/membersApi";
import { listPasses } from "./visitorsApi";

export default function GateEntryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [passes, setPasses] = useState([]);
  const [formData, setFormData] = useState({
    visitorName: "",
    phone: "",
    cnic: "",
    hostMember: "",
    purpose: "",
    gate: "Main Gate",
    vehicleNumber: "",
    remarks: "",
    passId: "",
  });

  useEffect(() => {
    fetchMembers();
    fetchActivePasses();
  }, []);

  const fetchMembers = async () => {
    try {
      const result = await listMembers({ status: "Active", limit: 500 });
      setMembers(result.members || result.data || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  const fetchActivePasses = async () => {
    try {
      const result = await listPasses({ status: "Active", limit: 100 });
      setPasses(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      console.error("Failed to fetch passes:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        toast.error(result.data.blacklistWarning, { duration: 6000, icon: <AlertTriangle className="text-orange-500" /> });
      } else {
        toast.success(result.message || "Visitor entry created");
      }

      // Reset form
      setFormData({
        visitorName: "",
        phone: "",
        cnic: "",
        hostMember: "",
        purpose: "",
        gate: "Main Gate",
        vehicleNumber: "",
        remarks: "",
        passId: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto" data-tour="visitors-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2" data-tour="visitors-page-heading">
          <UserCheck className="w-8 h-8" />
          Gate Entry
        </h1>
        <p className="text-gray-600 mt-1">Quick visitor entry form for security guards</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6" data-tour="visitors-form">
        {/* Visitor Name */}
        <div data-tour="visitors-name">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Visitor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="visitorName"
            value={formData.visitorName}
            onChange={handleChange}
            className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter visitor name"
            required
          />
        </div>

        {/* Phone & CNIC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">CNIC</label>
            <input
              type="text"
              name="cnic"
              value={formData.cnic}
              onChange={handleChange}
              className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="XXXXX-XXXXXXX-X"
            />
          </div>
        </div>

        {/* Host Member */}
        <div data-tour="visitors-host">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Host Member</label>
          <select
            name="hostMember"
            value={formData.hostMember}
            onChange={handleChange}
            className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Host --</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.membershipNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Purpose</label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Personal visit, Delivery, Contractor"
          />
        </div>

        {/* Gate */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Gate</label>
          <input
            type="text"
            name="gate"
            value={formData.gate}
            onChange={handleChange}
            className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Gate name"
          />
        </div>

        {/* Vehicle */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle Number
          </label>
          <input
            type="text"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="ABC-123"
          />
        </div>

        {/* Pass (Optional) */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Pass (if any)</label>
          <select
            name="passId"
            value={formData.passId}
            onChange={handleChange}
            className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- No Pass --</option>
            {passes.map((p) => (
              <option key={p._id} value={p._id}>
                {p.passNumber} - {p.holderName} ({p.type})
              </option>
            ))}
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Optional notes"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            data-tour="visitors-submit"
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-4 text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Log Entry"}
          </button>
          <button
            data-tour="visitors-active-link"
            type="button"
            onClick={() => navigate("/security/visitors/active")}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 text-lg font-semibold rounded-lg hover:bg-gray-300"
          >
            View Active
          </button>
        </div>
      </form>
    </div>
  );
}

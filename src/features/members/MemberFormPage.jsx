import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  createMember,
  updateMember,
  getMemberById,
  checkDuplicates,
} from "./membersApi";

export default function MemberFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    phone: "",
    email: "",
    address: "",
    status: "Active",
    nominee: {
      name: "",
      relation: "",
      cnic: "",
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadMember();
    }
  }, [id]);

  const loadMember = async () => {
    try {
      setLoading(true);
      const member = await getMemberById(id);
      setFormData({
        name: member.name || "",
        cnic: member.cnic || "",
        phone: member.phone || "",
        email: member.email || "",
        address: member.address || "",
        status: member.status || "Active",
        nominee: member.nominee || { name: "", relation: "", cnic: "" },
      });
    } catch (error) {
      toast.error("Failed to load member");
      navigate("/members");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("nominee.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        nominee: { ...prev.nominee, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckDuplicates = async () => {
    if (!formData.cnic && !formData.phone) return;

    try {
      const result = await checkDuplicates({
        cnic: formData.cnic,
        phone: formData.phone,
        excludeId: isEdit ? id : null,
      });

      if (result.hasDuplicates) {
        setDuplicateWarning(result);
      } else {
        setDuplicateWarning(null);
      }
    } catch (error) {
      console.error("Duplicate check failed:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.cnic || formData.phone) {
        handleCheckDuplicates();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.cnic, formData.phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        nominee:
          formData.nominee.name || formData.nominee.relation || formData.nominee.cnic
            ? formData.nominee
            : null,
      };

      if (isEdit) {
        await updateMember(id, payload);
        toast.success("Member updated successfully");
      } else {
        await createMember(payload);
        toast.success("Member created successfully");
      }

      navigate("/members");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save member");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/members")}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Member" : "Add New Member"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEdit ? "Update member information" : "Register a new member"}
          </p>
        </div>
      </div>

      {/* Duplicate Warning */}
      {duplicateWarning?.hasDuplicates && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900">
                Possible Duplicate Member(s) Found
              </h3>
              <p className="text-sm text-amber-800 mt-1">
                The following member(s) have matching CNIC or phone number:
              </p>
              <ul className="mt-2 space-y-1">
                {duplicateWarning.candidates.map((candidate) => (
                  <li
                    key={candidate._id}
                    className="text-sm text-amber-800 flex items-center gap-2"
                  >
                    <span className="font-medium">{candidate.name}</span>
                    <span className="text-amber-600">({candidate.memberId})</span>
                    <span className="text-xs px-2 py-0.5 bg-amber-200 rounded">
                      Matched on: {candidate.matchedOn.join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-amber-800 mt-2">
                You can still proceed if this is a different person.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNIC <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                placeholder="12345-1234567-1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Nominee Information */}
        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900">Nominee Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nominee Name
              </label>
              <input
                type="text"
                name="nominee.name"
                value={formData.nominee.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relation
              </label>
              <input
                type="text"
                name="nominee.relation"
                value={formData.nominee.relation}
                onChange={handleChange}
                placeholder="e.g., Son, Wife, Brother"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nominee CNIC
              </label>
              <input
                type="text"
                name="nominee.cnic"
                value={formData.nominee.cnic}
                onChange={handleChange}
                placeholder="12345-1234567-1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate("/members")}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : isEdit ? "Update Member" : "Create Member"}
          </button>
        </div>
      </form>
    </div>
  );
}

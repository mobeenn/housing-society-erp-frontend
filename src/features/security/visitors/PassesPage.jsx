import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CreditCard, Plus, X, Edit2 } from "lucide-react";
import { listPasses, createPass, updatePass, deletePass } from "./visitorsApi";
import { listMembers } from "../../members/membersApi";

export default function PassesPage() {
  const [passes, setPasses] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPass, setEditingPass] = useState(null);
  const [formData, setFormData] = useState({
    passNumber: "",
    type: "Visitor",
    holderName: "",
    phone: "",
    cnic: "",
    validFrom: "",
    validTo: "",
    relatedMember: "",
    purpose: "",
    notes: "",
  });

  useEffect(() => {
    fetchPasses();
    fetchMembers();
  }, []);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const result = await listPasses({ limit: 100 });
      setPasses(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      toast.error("Failed to fetch passes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const result = await listMembers({ status: "Active", limit: 500 });
      setMembers(result.members || result.data || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      passNumber: "",
      type: "Visitor",
      holderName: "",
      phone: "",
      cnic: "",
      validFrom: "",
      validTo: "",
      relatedMember: "",
      purpose: "",
      notes: "",
    });
    setEditingPass(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPass) {
        await updatePass(editingPass._id, {
          status: formData.status,
          validTo: formData.validTo,
          notes: formData.notes,
        });
        toast.success("Pass updated");
      } else {
        await createPass({
          ...formData,
          relatedMember: formData.relatedMember || null,
          phone: formData.phone || null,
          cnic: formData.cnic || null,
          purpose: formData.purpose || null,
          notes: formData.notes || null,
        });
        toast.success("Pass created");
      }
      resetForm();
      fetchPasses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save pass");
    }
  };

  const handleEdit = (pass) => {
    setEditingPass(pass);
    setFormData({
      passNumber: pass.passNumber,
      type: pass.type,
      holderName: pass.holderName,
      phone: pass.phone || "",
      cnic: pass.cnic || "",
      validFrom: pass.validFrom,
      validTo: pass.validTo,
      relatedMember: pass.relatedMember || "",
      purpose: pass.purpose || "",
      notes: pass.notes || "",
      status: pass.status,
    });
    setShowForm(true);
  };

  const handleRevoke = async (id, passNumber) => {
    if (!confirm(`Revoke pass ${passNumber}?`)) return;

    try {
      await updatePass(id, { status: "Revoked" });
      toast.success("Pass revoked");
      fetchPasses();
    } catch (error) {
      toast.error("Failed to revoke pass");
    }
  };

  const handleDelete = async (id, passNumber) => {
    if (!confirm(`Permanently delete pass ${passNumber}?`)) return;

    try {
      await deletePass(id);
      toast.success("Pass deleted");
      fetchPasses();
    } catch (error) {
      toast.error("Failed to delete pass");
    }
  };

  return (
    <div className="p-6" data-tour="visitors-passes-page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-display font-bold text-primary flex items-center gap-2" data-tour="visitors-passes-heading">
            <CreditCard className="w-8 h-8" />
            Passes
          </h1>
          <p className="text-secondary mt-1">Issue and manage visitor, contractor, and temporary passes</p>
        </div>
        <button
          data-tour="visitors-new-pass"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-on-accent rounded-control hover:bg-accent-hover"
        >
          <Plus className="w-5 h-5" />
          New Pass
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-control shadow-overlay max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-h2 font-bold">
                {editingPass ? "Edit Pass" : "Create New Pass"}
              </h2>
              <button onClick={resetForm} className="text-muted hover:text-secondary">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4" data-tour="visitors-pass-form">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body font-medium text-primary mb-1">
                    Pass Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="passNumber"
                    value={formData.passNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                    required
                    disabled={!!editingPass}
                  />
                </div>
                <div>
                  <label className="block text-body font-medium text-primary mb-1">
                    Type <span className="text-danger">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                    required
                    disabled={!!editingPass}
                  >
                    <option value="Visitor">Visitor</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-body font-medium text-primary mb-1">
                  Holder Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="holderName"
                  value={formData.holderName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                  required
                  disabled={!!editingPass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body font-medium text-primary mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                    disabled={!!editingPass}
                  />
                </div>
                <div>
                  <label className="block text-body font-medium text-primary mb-1">CNIC</label>
                  <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                    disabled={!!editingPass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body font-medium text-primary mb-1">
                    Valid From <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                    required
                    disabled={!!editingPass}
                  />
                </div>
                <div>
                  <label className="block text-body font-medium text-primary mb-1">
                    Valid To <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="validTo"
                    value={formData.validTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-body font-medium text-primary mb-1">Related Member</label>
                <select
                  name="relatedMember"
                  value={formData.relatedMember}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                  disabled={!!editingPass}
                >
                  <option value="">-- None --</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.membershipNumber})
                    </option>
                  ))}
                </select>
              </div>

              {editingPass && (
                <div>
                  <label className="block text-body font-medium text-primary mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Revoked">Revoked</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-body font-medium text-primary mb-1">Purpose</label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                  disabled={!!editingPass}
                />
              </div>

              <div>
                <label className="block text-body font-medium text-primary mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-control focus:ring-2 focus:ring-info"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-accent text-on-accent px-4 py-2 rounded-control hover:bg-accent-hover"
                >
                  {editingPass ? "Update Pass" : "Create Pass"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-surface-muted text-primary px-4 py-2 rounded-control hover:bg-surface-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Passes List */}
      {loading ? (
        <div className="text-center py-12 text-secondary">Loading...</div>
      ) : passes.length === 0 ? (
        <div className="bg-surface rounded-control shadow-none p-12 text-center">
          <CreditCard className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-secondary text-h2">No passes issued yet</p>
        </div>
      ) : (
        <div className="grid gap-4" data-tour="visitors-passes-list">
          {passes.map((pass) => {
            const isExpired = pass.validTo < new Date().toISOString().split("T")[0];
            const statusColor =
              pass.status === "Active"
                ? isExpired
                  ? "bg-warning-soft text-warning"
                  : "bg-success-soft text-success"
                : pass.status === "Revoked"
                ? "bg-danger-soft text-danger"
                : "bg-surface-muted text-primary";

            return (
              <div key={pass._id} className="bg-surface rounded-control shadow-none p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-h2 font-semibold text-primary">{pass.passNumber}</h3>
                    <span className={`px-2 py-1 text-small font-medium rounded-control ${statusColor}`}>
                      {isExpired && pass.status === "Active" ? "Expired" : pass.status}
                    </span>
                    <span className="px-2 py-1 text-small font-medium bg-info-soft text-info rounded-control">
                      {pass.type}
                    </span>
                  </div>
                  <p className="text-body text-primary mt-1">{pass.holderName}</p>
                  <div className="mt-1 text-body text-secondary">
                    <p>
                      Valid: {pass.validFrom} to {pass.validTo}
                    </p>
                    {pass.relatedMemberRef && (
                      <p>Related to: {pass.relatedMemberRef.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pass)}
                    className="p-2 text-info hover:bg-info-soft rounded-control"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {pass.status === "Active" && (
                    <button
                      onClick={() => handleRevoke(pass._id, pass.passNumber)}
                      className="px-3 py-1 bg-warning text-on-accent text-body rounded-control hover:bg-warning"
                    >
                      Revoke
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(pass._id, pass.passNumber)}
                    className="p-2 text-danger hover:bg-danger-soft rounded-control"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

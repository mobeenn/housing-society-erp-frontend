import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { CreditCard, Edit2, Plus, Trash2 } from "lucide-react";
import AsyncMemberSelect from "@/components/common/AsyncMemberSelect";
import {
  Button,
  Card,
  ConfirmDialog,
  FormGrid,
  Input,
  Modal,
  PageSkeleton,
  StatusPill,
} from "@/components/ui";
import { createPass, deletePass, listPasses, updatePass } from "./visitorsApi";

const emptyForm = {
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
  status: "Active",
};

export default function PassesPage() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPass, setEditingPass] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [confirm, setConfirm] = useState({ isOpen: false, type: null, pass: null, loading: false });

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

  useEffect(() => {
    fetchPasses();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingPass(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  const runConfirm = async () => {
    if (!confirm.pass) return;
    setConfirm((prev) => ({ ...prev, loading: true }));
    try {
      if (confirm.type === "revoke") {
        await updatePass(confirm.pass._id, { status: "Revoked" });
        toast.success("Pass revoked");
      } else {
        await deletePass(confirm.pass._id);
        toast.success("Pass deleted");
      }
      setConfirm({ isOpen: false, type: null, pass: null, loading: false });
      fetchPasses();
    } catch {
      toast.error(confirm.type === "revoke" ? "Failed to revoke pass" : "Failed to delete pass");
      setConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6" data-tour="visitors-passes-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-h1 font-bold text-primary" data-tour="visitors-passes-heading">
            Passes
          </h1>
          <p className="mt-1 text-body text-secondary">
            Issue and manage visitor, contractor, and temporary passes
          </p>
        </div>
        <Button data-tour="visitors-new-pass" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Pass
        </Button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingPass ? "Edit Pass" : "Create New Pass"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4" data-tour="visitors-pass-form">
          <FormGrid cols={2}>
            <Input
              label="Pass number *"
              name="passNumber"
              value={formData.passNumber}
              onChange={handleChange}
              required
              disabled={Boolean(editingPass)}
            />
            <div>
              <label className="mb-1.5 block text-label text-secondary">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={Boolean(editingPass)}
                className="min-h-11 w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 text-body disabled:opacity-60"
              >
                <option value="Visitor">Visitor</option>
                <option value="Contractor">Contractor</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
          </FormGrid>

          <Input
            label="Holder name *"
            name="holderName"
            value={formData.holderName}
            onChange={handleChange}
            required
            disabled={Boolean(editingPass)}
          />

          <FormGrid cols={2}>
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} disabled={Boolean(editingPass)} />
            <Input label="CNIC" name="cnic" value={formData.cnic} onChange={handleChange} disabled={Boolean(editingPass)} />
          </FormGrid>

          <FormGrid cols={2}>
            <Input
              label="Valid from *"
              type="date"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleChange}
              required
              disabled={Boolean(editingPass)}
            />
            <Input
              label="Valid to *"
              type="date"
              name="validTo"
              value={formData.validTo}
              onChange={handleChange}
              required
            />
          </FormGrid>

          <div>
            <label className="mb-1.5 block text-label text-secondary">Related member</label>
            <AsyncMemberSelect
              value={formData.relatedMember}
              onChange={(memberId) => setFormData((prev) => ({ ...prev, relatedMember: memberId || "" }))}
              emptyLabel="-- None --"
              disabled={Boolean(editingPass)}
            />
          </div>

          {editingPass && (
            <div>
              <label className="mb-1.5 block text-label text-secondary">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="min-h-11 w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 text-body"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Revoked">Revoked</option>
              </select>
            </div>
          )}

          <Input
            label="Purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            disabled={Boolean(editingPass)}
          />

          <div>
            <label className="mb-1.5 block text-label text-secondary">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-control border border-border-strong bg-surface-raised px-3 py-2.5 text-body"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={resetForm} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {editingPass ? "Update Pass" : "Create Pass"}
            </Button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <PageSkeleton variant="list" label="Loading passes" />
      ) : passes.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-muted" />
            <p className="text-body text-secondary">No passes issued yet</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4" data-tour="visitors-passes-list">
          {passes.map((pass) => {
            const isExpired = pass.validTo < new Date().toISOString().split("T")[0];
            const displayStatus = isExpired && pass.status === "Active" ? "Expired" : pass.status;
            return (
              <Card key={pass._id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-h2 font-semibold text-primary">{pass.passNumber}</h3>
                      <StatusPill status={displayStatus} />
                      <span className="rounded-control bg-info-soft px-2 py-1 text-small font-medium text-info">
                        {pass.type}
                      </span>
                    </div>
                    <p className="text-body text-primary">{pass.holderName}</p>
                    <p className="text-body text-secondary">
                      Valid: {pass.validFrom} to {pass.validTo}
                    </p>
                    {pass.relatedMemberRef && (
                      <p className="text-body text-secondary">Related to: {pass.relatedMemberRef.name}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleEdit(pass)}>
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    {pass.status === "Active" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirm({ isOpen: true, type: "revoke", pass, loading: false })}
                      >
                        Revoke
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-danger"
                      onClick={() => setConfirm({ isOpen: true, type: "delete", pass, loading: false })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={() => !confirm.loading && setConfirm({ isOpen: false, type: null, pass: null, loading: false })}
        onConfirm={runConfirm}
        title={confirm.type === "revoke" ? "Revoke pass?" : "Delete pass?"}
        message={
          confirm.type === "revoke"
            ? `Revoke pass ${confirm.pass?.passNumber}?`
            : `Permanently delete pass ${confirm.pass?.passNumber}?`
        }
        confirmLabel={confirm.type === "revoke" ? "Revoke" : "Delete"}
        isLoading={confirm.loading}
      />
    </div>
  );
}

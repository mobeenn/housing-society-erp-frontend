import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Hash, Edit, Save, X, Loader2, RefreshCw } from "lucide-react";
import { administrationApi } from "./administrationApi";

const numberingRuleSchema = z.object({
  prefix: z.string().min(1, "Prefix is required").max(10),
  padLength: z.coerce.number().min(3).max(10),
  resetPolicy: z.enum(["never", "daily", "yearly", "monthly"]),
});

export default function NumberingRulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(numberingRuleSchema),
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await administrationApi.getNumberingRules();
      setRules(data);
    } catch (error) {
      toast.error("Failed to load numbering rules");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    reset({
      prefix: rule.prefix,
      padLength: rule.padLength,
      resetPolicy: rule.resetPolicy,
    });
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await administrationApi.updateNumberingRule(editingRule._id, data);
      toast.success("Numbering rule updated successfully");
      setEditingRule(null);
      loadRules();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update rule");
    } finally {
      setSaving(false);
    }
  };

  const formatPreview = (rule) => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const sequence = String(1).padStart(rule.padLength, "0");

    let formatted = rule.prefix;
    if (rule.resetPolicy === "daily") {
      const day = String(new Date().getDate()).padStart(2, "0");
      formatted += `-${year}${month}${day}`;
    } else if (rule.resetPolicy === "yearly") {
      formatted += `-${year}`;
    } else if (rule.resetPolicy === "monthly") {
      formatted += `-${year}${month}`;
    }
    formatted += `-${sequence}`;

    return formatted;
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-primary">Numbering Rules</h1>
        <p className="mt-1 text-body text-secondary">
          Configure auto-incrementing document and entity numbering sequences.
        </p>
      </div>

      {/* Rules Table */}
      <div className="rounded-card border border-border bg-surface shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body">
            <thead className="border-b border-border bg-canvas text-small font-semibold text-secondary">
              <tr>
                <th className="px-6 py-3">Entity Type</th>
                <th className="px-6 py-3">Prefix</th>
                <th className="px-6 py-3">Current Sequence</th>
                <th className="px-6 py-3">Padding</th>
                <th className="px-6 py-3">Reset Policy</th>
                <th className="px-6 py-3">Format Preview</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rules.map((rule) => (
                <tr key={rule._id} className="hover:bg-canvas">
                  <td className="px-6 py-4 font-medium capitalize text-primary">
                    {rule.entityType}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-control bg-surface-muted px-2.5 py-1 text-small font-semibold text-primary">
                      {rule.prefix}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary">{rule.currentSequence}</td>
                  <td className="px-6 py-4 text-secondary">{rule.padLength} digits</td>
                  <td className="px-6 py-4 capitalize text-secondary">{rule.resetPolicy}</td>
                  <td className="px-6 py-4 font-mono text-small font-medium text-accent">
                    {formatPreview(rule)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="inline-flex items-center gap-1 rounded-control p-1.5 text-secondary hover:bg-surface-muted hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-overlay">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-h2 font-semibold text-primary">
                Edit Numbering Rule: <span className="capitalize">{editingRule.entityType}</span>
              </h2>
              <button
                onClick={() => setEditingRule(null)}
                className="rounded-control p-1 text-muted hover:bg-surface-muted hover:text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-body font-medium text-primary">Prefix *</label>
                <input
                  type="text"
                  {...register("prefix")}
                  className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                {errors.prefix && (
                  <p className="mt-1 text-small text-danger">{errors.prefix.message}</p>
                )}
              </div>

              <div>
                <label className="block text-body font-medium text-primary">
                  Padding Length (Digits) *
                </label>
                <input
                  type="number"
                  {...register("padLength")}
                  className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                {errors.padLength && (
                  <p className="mt-1 text-small text-danger">{errors.padLength.message}</p>
                )}
              </div>

              <div>
                <label className="block text-body font-medium text-primary">Reset Policy *</label>
                <select
                  {...register("resetPolicy")}
                  className="mt-1 block w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily (Reset every day)</option>
                  <option value="yearly">Yearly (Reset every Jan 1)</option>
                  <option value="monthly">Monthly (Reset every 1st)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="rounded-control border border-border-strong px-4 py-2 text-body font-medium text-primary hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent hover:bg-accent disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

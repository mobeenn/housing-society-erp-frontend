import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

const clone = (value) => JSON.parse(JSON.stringify(value || {}));

export default function StatutoryConfigTab({ setup, onSave, canEdit = false, isLoading = false }) {
  const [form, setForm] = useState({ salaryComponents: [], statutoryConfig: { eobiPercent: 0, providentFundPercent: 0 }, taxSlabs: [] });

  useEffect(() => {
    if (setup) {
      setForm({
        salaryComponents: clone(setup.salaryComponents || []),
        statutoryConfig: { eobiPercent: 0, providentFundPercent: 0, ...(setup.statutoryConfig || {}) },
        taxSlabs: clone(setup.taxSlabs || []),
      });
    }
  }, [setup]);

  const updateComponent = (index, field, value) => setForm((current) => ({ ...current, salaryComponents: current.salaryComponents.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const updateSlab = (index, field, value) => setForm((current) => ({ ...current, taxSlabs: current.taxSlabs.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const addComponent = () => setForm((current) => ({ ...current, salaryComponents: [...current.salaryComponents, { name: "", type: "Earning", calculationType: "Fixed" }] }));
  const addSlab = () => setForm((current) => ({ ...current, taxSlabs: [...current.taxSlabs, { fromAmount: "", toAmount: "", rate: "" }] }));
  const removeComponent = (index) => setForm((current) => ({ ...current, salaryComponents: current.salaryComponents.filter((_, itemIndex) => itemIndex !== index) }));
  const removeSlab = (index) => setForm((current) => ({ ...current, taxSlabs: current.taxSlabs.filter((_, itemIndex) => itemIndex !== index) }));

  const save = async () => {
    if (form.salaryComponents.some((item) => !item.name.trim())) {
      toast.error("Every salary component needs a name");
      return;
    }
    const payload = {
      ...form,
      statutoryConfig: {
        eobiPercent: Number(form.statutoryConfig?.eobiPercent || 0),
        providentFundPercent: Number(form.statutoryConfig?.providentFundPercent || 0),
      },
      taxSlabs: form.taxSlabs.map((slab) => ({
        fromAmount: Number(slab.fromAmount || 0),
        toAmount: slab.toAmount === "" || slab.toAmount === null ? null : Number(slab.toAmount),
        rate: Number(slab.rate || 0),
      })),
    };
    await onSave(payload);
  };

  return (
    <div className="space-y-5">
      <Card title="Salary Components" actions={canEdit && <Button size="sm" variant="outline" onClick={addComponent}><Plus className="h-4 w-4" /> Add Component</Button>}>
        <p className="mb-4 text-sm text-neutral-500">Define how each employee's salary structure amount is interpreted.</p>
        <div className="space-y-2">
          {form.salaryComponents.map((component, index) => (
            <div key={`${component.name}-${index}`} className="grid gap-2 md:grid-cols-[1fr_150px_180px_40px]">
              <Input label="Component" value={component.name} disabled={!canEdit} onChange={(event) => updateComponent(index, "name", event.target.value)} />
              <label className="text-sm font-medium text-neutral-700">Type
                <select value={component.type} disabled={!canEdit} onChange={(event) => updateComponent(index, "type", event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100">
                  <option value="Earning">Earning</option><option value="Deduction">Deduction</option>
                </select>
              </label>
              <label className="text-sm font-medium text-neutral-700">Calculation
                <select value={component.calculationType} disabled={!canEdit} onChange={(event) => updateComponent(index, "calculationType", event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100">
                  <option value="Fixed">Fixed</option><option value="Percentage">Percentage</option>
                </select>
              </label>
              <button type="button" disabled={!canEdit} onClick={() => removeComponent(index)} className="mt-6 rounded-lg p-2 text-danger-600 hover:bg-danger-50 disabled:opacity-40" aria-label="Remove component"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {form.salaryComponents.length === 0 && <p className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">No salary components configured.</p>}
        </div>
      </Card>

      <Card title="Statutory Contributions">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="EOBI (%)" type="number" min="0" max="100" step="0.01" disabled={!canEdit} value={form.statutoryConfig.eobiPercent ?? 0} onChange={(event) => setForm((current) => ({ ...current, statutoryConfig: { ...current.statutoryConfig, eobiPercent: event.target.value } }))} />
          <Input label="Provident Fund (%)" type="number" min="0" max="100" step="0.01" disabled={!canEdit} value={form.statutoryConfig.providentFundPercent ?? 0} onChange={(event) => setForm((current) => ({ ...current, statutoryConfig: { ...current.statutoryConfig, providentFundPercent: event.target.value } }))} />
        </div>
        <p className="mt-3 text-xs text-neutral-500">Contributions are calculated from prorated gross earnings and posted as liabilities when the run is approved.</p>
      </Card>

      <Card title="Progressive Tax Slabs" actions={canEdit && <Button size="sm" variant="outline" onClick={addSlab}><Plus className="h-4 w-4" /> Add Slab</Button>}>
        <p className="mb-4 text-sm text-neutral-500">Enter annual taxable-income slabs. Leave the upper bound blank for the final open-ended slab.</p>
        <div className="space-y-3">
          {form.taxSlabs.map((slab, index) => (
            <div key={`slab-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_40px]">
              <Input label="From (annual)" type="number" min="0" step="0.01" disabled={!canEdit} value={slab.fromAmount} onChange={(event) => updateSlab(index, "fromAmount", event.target.value)} />
              <Input label="To (annual)" type="number" min="0" step="0.01" disabled={!canEdit} value={slab.toAmount ?? ""} onChange={(event) => updateSlab(index, "toAmount", event.target.value)} />
              <Input label="Rate (%)" type="number" min="0" max="100" step="0.01" disabled={!canEdit} value={slab.rate} onChange={(event) => updateSlab(index, "rate", event.target.value)} />
              <button type="button" disabled={!canEdit} onClick={() => removeSlab(index)} className="mt-6 rounded-lg p-2 text-danger-600 hover:bg-danger-50 disabled:opacity-40" aria-label="Remove tax slab"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {form.taxSlabs.length === 0 && <p className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">No tax slabs configured; tax will be zero.</p>}
        </div>
      </Card>

      {canEdit && <div className="flex justify-end"><Button onClick={save} isLoading={isLoading}><Save className="h-4 w-4" /> Save Payroll Setup</Button></div>}
    </div>
  );
}

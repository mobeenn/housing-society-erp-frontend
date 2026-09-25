import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import Modal from "@/components/ui/Modal";

export default function SalaryStructureModal({ isOpen, onClose, employee, components = [], onSubmit, isLoading = false }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setRows((employee?.salaryStructure || []).map((item) => ({ ...item })));
    }
  }, [isOpen, employee]);

  const addRow = () => setRows((current) => [...current, { component: components[0]?.name || "", amount: "" }]);
  const update = (index, field, value) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  const remove = (index) => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(rows.filter((row) => row.component && Number(row.amount) >= 0).map((row) => ({ component: row.component, amount: Number(row.amount) })));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Salary Structure${employee?.name ? ` — ${employee.name}` : ""}`} size="lg">
      <form onSubmit={submit} className="space-y-4" data-tour="hr-payroll-salary-structure">
        <p className="text-body text-secondary">Fixed amounts are entered in PKR. Percentage components use the employee basic salary as their base.</p>
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={`${row.component}-${index}`} className="grid grid-cols-[1fr_150px_40px] gap-2">
              <select value={row.component} onChange={(event) => update(index, "component", event.target.value)} required className="rounded-control border border-border-strong px-3 py-2 text-body">
                <option value="">Select component</option>
                {components.map((component) => <option key={component.name} value={component.name}>{component.name}</option>)}
                {!components.some((component) => component.name === row.component) && row.component && <option value={row.component}>{row.component}</option>}
              </select>
              <input type="number" min="0" step="0.01" value={row.amount} onChange={(event) => update(index, "amount", event.target.value)} required className="rounded-control border border-border-strong px-3 py-2 text-body" />
              <button type="button" onClick={() => remove(index)} className="rounded-control p-2 text-danger hover:bg-danger-soft" aria-label="Remove salary component"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {rows.length === 0 && <p className="rounded-control bg-canvas p-4 text-center text-body text-secondary">No salary components assigned yet.</p>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow}><Plus className="h-4 w-4" /> Add Component</Button>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}><Save className="h-4 w-4" /> Save Structure</Button>
        </div>
      </form>
    </Modal>
  );
}

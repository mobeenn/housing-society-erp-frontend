import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function LoanFormModal({ isOpen, onClose, employees = [], onSubmit, isLoading = false }) {
  const [form, setForm] = useState({ employee: "", amount: "", installmentAmount: "", disbursedDate: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    if (isOpen) {
      setForm({ employee: employees[0]?._id || "", amount: "", installmentAmount: "", disbursedDate: new Date().toISOString().slice(0, 10) });
    }
  }, [isOpen, employees]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit({
      employee: form.employee,
      amount: Number(form.amount),
      installmentAmount: Number(form.installmentAmount),
      disbursedDate: form.disbursedDate,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Disburse Employee Loan" size="md">
      <form onSubmit={submit} className="space-y-4" data-tour="hr-payroll-loan-form">
        <label className="block text-sm font-medium text-neutral-700">
          Employee
          <select name="employee" value={form.employee} onChange={update} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select employee</option>
            {employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name} ({employee.employeeId})</option>)}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Loan amount" name="amount" type="number" min="1" step="0.01" value={form.amount} onChange={update} required />
          <Input label="Monthly installment" name="installmentAmount" type="number" min="1" step="0.01" value={form.installmentAmount} onChange={update} required />
        </div>
        <Input label="Disbursement date" name="disbursedDate" type="date" value={form.disbursedDate} onChange={update} required />
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Disburse Loan</Button>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Plus, Search, WalletCards } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useCan } from "@/hooks/useCan";
import { hrPayrollApi } from "./hrPayrollApi";
import LoanFormModal from "./components/LoanFormModal";
import { money, statusClass } from "./payrollUi";

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const canCreate = useCan("hr-payroll", "create");
  const canEdit = useCan("hr-payroll", "edit");

  const load = async () => {
    setLoading(true);
    try {
      const [loanResult, employeeResult] = await Promise.all([
        hrPayrollApi.listLoans({ limit: 200, status: status || undefined }),
        hrPayrollApi.listEmployees(),
      ]);
      setLoans(loanResult?.data || []);
      setEmployees(employeeResult || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load employee loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const visibleLoans = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return loans;
    return loans.filter((loan) => [loan.employeeRef?.name, loan.employeeRef?.employeeId, loan.employeeRef?.department].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [loans, search]);

  const createLoan = async (data) => {
    setSaving(true);
    try {
      await hrPayrollApi.createLoan(data);
      toast.success("Loan disbursed successfully");
      setIsModalOpen(false);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to disburse loan");
    } finally {
      setSaving(false);
    }
  };

  const closeLoan = async (loan) => {
    if (!window.confirm(`Close the loan for ${loan.employeeRef?.name || "this employee"}?`)) return;
    try {
      await hrPayrollApi.closeLoan(loan._id);
      toast.success("Loan closed");
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to close loan");
    }
  };

  return (
    <div className="space-y-5" data-tour="hr-payroll-loans-page">
      <Card title="Employee Loans" actions={canCreate && <Button data-tour="hr-payroll-disburse" onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4" /> Disburse Loan</Button>}>
        <div className="grid gap-3 md:grid-cols-[1fr_180px]" data-tour="hr-payroll-loan-filters">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee..." className="pl-9" /></div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
            <option value="">All statuses</option><option value="Active">Active</option><option value="Closed">Closed</option>
          </select>
        </div>
      </Card>

      <Card>
        {loading ? <div className="py-10 text-center text-sm text-neutral-500">Loading loans...</div> : visibleLoans.length === 0 ? <div className="py-10 text-center"><WalletCards className="mx-auto mb-2 h-8 w-8 text-neutral-300" /><p className="text-sm text-neutral-500">No loans found.</p></div> : (
          <div className="overflow-x-auto" data-tour="hr-payroll-loans-list">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500"><tr><th className="px-3 py-3">Employee</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Installment</th><th className="px-3 py-3">Remaining</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-neutral-100">
                {visibleLoans.map((loan) => <tr key={loan._id}>
                  <td className="px-3 py-4"><p className="font-medium text-neutral-900">{loan.employeeRef?.name || "Unknown"}</p><p className="text-xs text-neutral-500">{loan.employeeRef?.employeeId || "—"}</p></td>
                  <td className="px-3 py-4">{money(loan.amount)}</td><td className="px-3 py-4">{money(loan.installmentAmount)}</td><td className="px-3 py-4 font-medium">{money(loan.remainingBalance)}</td>
                  <td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(loan.status)}`}>{loan.status}</span></td>
                  <td className="px-3 py-4 text-right">{canEdit && loan.status === "Active" && <Button size="sm" variant="outline" onClick={() => closeLoan(loan)}><CheckCircle2 className="h-4 w-4" /> Close</Button>}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <LoanFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} employees={employees} onSubmit={createLoan} isLoading={saving} />
    </div>
  );
}

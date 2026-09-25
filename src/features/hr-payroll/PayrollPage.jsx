import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, FileText, Play, RefreshCw, UserRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useCan } from "@/hooks/useCan";
import { hrPayrollApi } from "./hrPayrollApi";
import SalaryStructureModal from "./components/SalaryStructureModal";
import { money, periodLabel, statusClass } from "./payrollUi";

const currentPeriod = () => ({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

export default function PayrollPage() {
  const [period, setPeriod] = useState(currentPeriod());
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [setup, setSetup] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [structureEmployee, setStructureEmployee] = useState(null);
  const [isStructureOpen, setIsStructureOpen] = useState(false);
  const [savingStructure, setSavingStructure] = useState(false);
  const canCreate = useCan("hr-payroll", "create");
  const canApprove = useCan("hr-payroll", "approve");
  const canEdit = useCan("hr-payroll", "edit");

  const load = async (preferredRunId = null) => {
    setLoading(true);
    try {
      const [runResult, setupResult, employeeResult] = await Promise.all([
        hrPayrollApi.listRuns({ year: period.year, month: period.month, limit: 50 }),
        hrPayrollApi.getSetup(),
        hrPayrollApi.listEmployees(),
      ]);
      const nextRuns = runResult?.data || [];
      setRuns(nextRuns);
      setSetup(setupResult);
      setEmployees(employeeResult || []);
      const runId = preferredRunId || selectedRun?._id;
      if (runId && nextRuns.some((run) => run._id === runId)) {
        setSelectedRun(await hrPayrollApi.getRun(runId));
      } else if (nextRuns.length) {
        setSelectedRun(await hrPayrollApi.getRun(nextRuns[0]._id));
      } else {
        setSelectedRun(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load payroll");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [period.year, period.month]);

  const generate = async () => {
    setActionLoading("generate");
    try {
      const run = await hrPayrollApi.generateDraft(period);
      setSelectedRun(run);
      toast.success("Payroll draft generated");
      await load(run._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate payroll draft");
    } finally {
      setActionLoading("");
    }
  };

  const selectRun = async (run) => {
    setActionLoading(`load-${run._id}`);
    try {
      setSelectedRun(await hrPayrollApi.getRun(run._id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load payroll run");
    } finally {
      setActionLoading("");
    }
  };

  const approve = async () => {
    if (!selectedRun || !window.confirm(`Approve payroll for ${periodLabel(selectedRun)}? This will post a GL journal.`)) return;
    setActionLoading("approve");
    try {
      const run = await hrPayrollApi.approve(selectedRun._id);
      setSelectedRun(run);
      toast.success("Payroll approved and posted to GL");
      await load(run._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve payroll");
    } finally {
      setActionLoading("");
    }
  };

  const markPaid = async () => {
    if (!selectedRun || !window.confirm(`Mark payroll for ${periodLabel(selectedRun)} as paid? Active loan balances will be reduced.`)) return;
    setActionLoading("pay");
    try {
      const run = await hrPayrollApi.markPaid(selectedRun._id);
      setSelectedRun(run);
      toast.success("Payroll marked paid");
      await load(run._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark payroll paid");
    } finally {
      setActionLoading("");
    }
  };

  const saveStructure = async (salaryStructure) => {
    setSavingStructure(true);
    try {
      const employee = await hrPayrollApi.assignSalaryStructure(structureEmployee._id, salaryStructure);
      const updatedEmployee = { ...structureEmployee, ...employee };
      setStructureEmployee(updatedEmployee);
      setEmployees((current) => current.map((item) => item._id === employee._id ? updatedEmployee : item));
      toast.success("Salary structure assigned");
      setIsStructureOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign salary structure");
    } finally {
      setSavingStructure(false);
    }
  };

  const totals = selectedRun?.totals || {};

  return (
    <div className="space-y-5" data-tour="hr-payroll-page">
      <Card title="Payroll Run" actions={<Button variant="outline" size="sm" onClick={() => load()}><RefreshCw className="h-4 w-4" /> Refresh</Button>}>
        <div className="grid gap-3 md:grid-cols-[150px_150px_auto] md:items-end" data-tour="hr-payroll-period">
          <label className="text-body font-medium text-primary">Month
            <select value={period.month} onChange={(event) => setPeriod((current) => ({ ...current, month: Number(event.target.value) }))} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body">
              {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(2000, index, 1).toLocaleString("en", { month: "long" })}</option>)}
            </select>
          </label>
          <Input label="Year" type="number" min="2000" max="2200" value={period.year} onChange={(event) => setPeriod((current) => ({ ...current, year: Number(event.target.value) }))} />
          {canCreate && <Button data-tour="hr-payroll-generate" onClick={generate} isLoading={actionLoading === "generate"}><Play className="h-4 w-4" /> Generate Draft</Button>}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Card title="Payroll History">
          {loading ? <p className="py-8 text-center text-body text-secondary">Loading payroll runs...</p> : runs.length === 0 ? <p className="py-8 text-center text-body text-secondary">No payroll runs for {period.year}.</p> : <div className="space-y-2" data-tour="hr-payroll-history">{runs.map((run) => <button key={run._id} onClick={() => selectRun(run)} className={`w-full rounded-control border p-3 text-left transition-colors ${selectedRun?._id === run._id ? "border-gold bg-gold-soft" : "border-border hover:bg-canvas"}`}><div className="flex items-center justify-between gap-2"><span className="font-medium text-primary">{periodLabel(run)}</span><span className={`rounded-full px-2 py-0.5 text-small font-medium ${statusClass(run.status)}`}>{run.status}</span></div><div className="mt-2 flex justify-between text-small text-secondary"><span>{run.entries?.length || 0} employees</span><span>Net {money(run.totals?.netPay)}</span></div></button>)}</div>}
        </Card>

        <Card title={selectedRun ? `Review — ${periodLabel(selectedRun)}` : "Payroll Review"} actions={selectedRun && <span className={`rounded-full px-2.5 py-1 text-small font-medium ${statusClass(selectedRun.status)}`}>{selectedRun.status}</span>}>
          {!selectedRun ? <div className="flex min-h-48 flex-col items-center justify-center text-center"><Banknote className="mb-2 h-10 w-10 text-muted" /><p className="text-body text-secondary">Generate or select a payroll run to review its entries.</p></div> : <>
            <div className="mb-4 grid gap-3 sm:grid-cols-4" data-tour="hr-payroll-review">
              <div className="rounded-control bg-canvas p-3"><p className="text-small text-secondary">Gross</p><p className="mt-1 font-semibold">{money(totals.earnings)}</p></div>
              <div className="rounded-control bg-canvas p-3"><p className="text-small text-secondary">Loan deduction</p><p className="mt-1 font-semibold">{money(totals.loanDeduction)}</p></div>
              <div className="rounded-control bg-canvas p-3"><p className="text-small text-secondary">Tax</p><p className="mt-1 font-semibold">{money(totals.tax)}</p></div>
              <div className="rounded-control bg-success-soft p-3"><p className="text-small text-success">Net payable</p><p className="mt-1 font-semibold text-success">{money(totals.netPay)}</p></div>
            </div>
            {selectedRun.journalEntryId && <p className="mb-4 flex items-center gap-2 rounded-control bg-info-soft px-3 py-2 text-small text-info"><FileText className="h-4 w-4" /> GL journal posted: {selectedRun.journalEntryId}</p>}
            <div className="overflow-x-auto"><table className="w-full text-left text-body"><thead className="border-b border-border text-small tracking-wide text-secondary"><tr><th className="px-2 py-3">Employee</th><th className="px-2 py-3">Earnings</th><th className="px-2 py-3">Deductions</th><th className="px-2 py-3">Loan</th><th className="px-2 py-3">Tax</th><th className="px-2 py-3">Net pay</th></tr></thead><tbody className="divide-y divide-border">{selectedRun.entries?.map((entry) => <tr key={entry.employee}><td className="px-2 py-3"><p className="font-medium">{entry.employeeRef?.name || entry.employeeName}</p><p className="text-small text-secondary">{entry.employeeId} · {entry.attendance?.prorationApplied ? `${entry.attendance.presentDays}/${entry.attendance.workingDays} days` : "Full attendance basis"}</p></td><td className="px-2 py-3">{money(entry.earnings)}</td><td className="px-2 py-3">{money(entry.deductions)}</td><td className="px-2 py-3">{money(entry.loanDeduction)}</td><td className="px-2 py-3">{money(entry.tax)}</td><td className="px-2 py-3 font-semibold">{money(entry.netPay)}</td></tr>)}</tbody></table></div>
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4" data-tour="hr-payroll-actions">
              {selectedRun.status === "Draft" && canApprove && <Button onClick={approve} isLoading={actionLoading === "approve"}><CheckCircle2 className="h-4 w-4" /> Approve &amp; Post GL</Button>}
              {selectedRun.status === "Approved" && canEdit && <Button onClick={markPaid} isLoading={actionLoading === "pay"}><CheckCircle2 className="h-4 w-4" /> Mark Paid</Button>}
            </div>
          </>}
        </Card>
      </div>

      <Card title="Salary Structures" actions={canEdit && <span className="text-small text-secondary">Assign components without changing the employee record screen.</span>}>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="text-body font-medium text-primary">Employee
            <select value={structureEmployee?._id || ""} onChange={(event) => setStructureEmployee(employees.find((employee) => employee._id === event.target.value) || null)} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body">
              <option value="">Select an active employee</option>{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name} ({employee.employeeId})</option>)}
            </select>
          </label>
          <Button variant="outline" disabled={!structureEmployee} onClick={() => setIsStructureOpen(true)}><UserRound className="h-4 w-4" /> Assign Structure</Button>
        </div>
      </Card>

      <SalaryStructureModal isOpen={isStructureOpen} onClose={() => setIsStructureOpen(false)} employee={structureEmployee} components={setup?.salaryComponents || []} onSubmit={saveStructure} isLoading={savingStructure} />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Download, FileBarChart, FileSpreadsheet, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui";
import Card from "@/components/ui/Card";
import { useCan } from "@/hooks/useCan";
import { hrPayrollApi } from "./hrPayrollApi";
import { downloadBlob, money, periodLabel, statusClass } from "./payrollUi";

export default function PayrollReportsPage() {
  const [runs, setRuns] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState("");
  const canExport = useCan("hr-payroll", "export");

  const load = async () => {
    setLoading(true);
    try {
      const result = await hrPayrollApi.listRuns({ limit: 100 });
      const rows = result?.data || [];
      setRuns(rows);
      if (!selectedId && rows[0]) setSelectedId(rows[0]._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load payroll reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selected = runs.find((run) => run._id === selectedId);

  const exportReport = async (type) => {
    if (!selectedId) return;
    setExporting(type);
    try {
      const blob = type === "register" ? await hrPayrollApi.exportRegister(selectedId) : await hrPayrollApi.exportPayslips(selectedId);
      downloadBlob(blob, type === "register" ? `payroll-register-${selectedId}.csv` : `payroll-payslips-${selectedId}.csv`);
      toast.success("Payroll export downloaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to export payroll report");
    } finally {
      setExporting("");
    }
  };

  return (
    <div className="space-y-5" data-tour="hr-payroll-reports-page">
      <Card title="Payroll Reports" actions={<Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>}>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end" data-tour="hr-payroll-report-filters">
          <label className="text-body font-medium text-primary">Payroll period
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body">
              <option value="">Select a payroll run</option>
              {runs.map((run) => <option key={run._id} value={run._id}>{periodLabel(run)} — {run.status}</option>)}
            </select>
          </label>
          {canExport && <div className="flex flex-wrap gap-2" data-tour="hr-payroll-report-export"><Button variant="outline" disabled={!selectedId || exporting === "register"} onClick={() => exportReport("register")} isLoading={exporting === "register"}><FileSpreadsheet className="h-4 w-4" /> Register CSV</Button><Button disabled={!selectedId || exporting === "payslips"} onClick={() => exportReport("payslips")} isLoading={exporting === "payslips"}><Download className="h-4 w-4" /> Payslips CSV</Button></div>}
        </div>
      </Card>

      {selected ? <Card title={`${periodLabel(selected)} Summary`} actions={<span className={`rounded-full px-2.5 py-1 text-small font-medium ${statusClass(selected.status)}`}>{selected.status}</span>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><div className="rounded-control bg-canvas p-3"><p className="text-small text-secondary">Employees</p><p className="mt-1 text-h2 font-semibold">{selected.entries?.length || 0}</p></div><div className="rounded-control bg-canvas p-3"><p className="text-small text-secondary">Gross payroll</p><p className="mt-1 text-h2 font-semibold">{money(selected.totals?.earnings)}</p></div><div className="rounded-control bg-canvas p-3"><p className="text-small text-secondary">Loan deductions</p><p className="mt-1 text-h2 font-semibold">{money(selected.totals?.loanDeduction)}</p></div><div className="rounded-control bg-canvas p-3"><p className="text-small text-secondary">Tax</p><p className="mt-1 text-h2 font-semibold">{money(selected.totals?.tax)}</p></div><div className="rounded-control bg-success-soft p-3"><p className="text-small text-success">Net payable</p><p className="mt-1 text-h2 font-semibold text-success">{money(selected.totals?.netPay)}</p></div></div>
        {selected.journalEntryId && <p className="mt-4 rounded-control bg-info-soft px-3 py-2 text-body text-info">GL journal reference: {selected.journalEntryId}</p>}
      </Card> : <Card><div className="flex min-h-48 flex-col items-center justify-center text-center"><FileBarChart className="mb-2 h-10 w-10 text-muted" /><p className="text-body text-secondary">Select a payroll run to view report totals and export register or payslips.</p></div></Card>}
    </div>
  );
}

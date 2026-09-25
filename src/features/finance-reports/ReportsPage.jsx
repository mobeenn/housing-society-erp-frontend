import { useEffect, useMemo, useState } from "react";
import { Download, FileBarChart, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Card } from "@/components/ui";
import { useCan } from "@/hooks/useCan";
import { exportReport, getReport, getReportCatalog } from "./reportsApi";

const monthStart = new Date();
monthStart.setDate(1);
const dateValue = (date) => date.toISOString().slice(0, 10);

const rowsFromReport = (report) => {
  if (Array.isArray(report?.data)) return report.data;
  if (!report?.data || typeof report.data !== "object") return [];
  const objectData = report.data;
  const collection = objectData.byStatus || objectData.byCategory || objectData.byDepartment;
  if (Array.isArray(collection)) return collection;
  return Object.entries(objectData).filter(([, value]) => typeof value !== "object").map(([label, value]) => ({ label, value }));
};

const displayValue = (value) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function ReportsPage() {
  const [catalog, setCatalog] = useState([]);
  const [type, setType] = useState("defaulters");
  const [startDate, setStartDate] = useState(dateValue(monthStart));
  const [endDate, setEndDate] = useState(dateValue(new Date()));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    getReportCatalog().then((items) => {
      setCatalog(items);
      if (items.length && !items.some((item) => item.key === type)) setType(items[0].key);
    }).catch(() => toast.error("Unable to load report catalog"));
  }, []);

  const load = async () => {
    setLoading(true);
    try { setReport(await getReport(type, { startDate, endDate })); }
    catch (error) { toast.error(error.response?.data?.message || "Failed to load report"); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (catalog.length) load(); }, [type, startDate, endDate, catalog.length]);

  const exportFile = async (format) => {
    setExporting(format);
    try {
      const blob = await exportReport(type, { startDate, endDate, format });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${type}.${format}`; anchor.click(); URL.revokeObjectURL(url);
    } catch (error) { toast.error(error.response?.data?.message || "Export failed"); }
    finally { setExporting(""); }
  };

  const rows = rowsFromReport(report);
  const selected = catalog.find((item) => item.key === type);
  const columns = useMemo(() => Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 12), [rows]);
  const grouped = catalog.reduce((groups, item) => { (groups[item.module] ||= []).push(item); return groups; }, {});
  const canExport = useCan("reports", "export");

  return <div className="space-y-6" data-tour="reports-page">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end" data-tour="reports-header"><div><h1 className="text-h1 font-bold text-primary">Reports Hub</h1><p className="mt-1 text-body text-secondary">Generate cross-module reports with quick date filters and exports.</p></div><div className="flex gap-2" data-tour="reports-export">{canExport && <><Button variant="outline" onClick={() => exportFile("pdf")} disabled={Boolean(exporting)}>{exporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} PDF</Button><Button onClick={() => exportFile("xlsx")} disabled={Boolean(exporting)}>{exporting === "xlsx" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Excel</Button></>}</div></div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-tour="reports-catalog">{Object.entries(grouped).map(([module, items]) => <Card key={module} title={module}><div className="space-y-2">{items.map((item) => <button key={item.key} onClick={() => setType(item.key)} className={`w-full rounded-control border p-3 text-left transition-colors duration-base ${type === item.key ? "border-gold bg-gold-soft" : "border-border hover:border-gold hover:bg-canvas"}`}><div className="flex items-center gap-2 text-body font-medium text-primary"><FileBarChart className="h-4 w-4 text-accent" />{item.label}</div><p className="mt-1 text-small text-secondary">{item.description}</p></button>)}</div></Card>)}</div>

    <Card title="Report filters"><div className="grid gap-4 md:grid-cols-4" data-tour="reports-filters"><label className="text-body font-medium text-primary">Report<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body font-normal">{catalog.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label><label className="text-body font-medium text-primary">From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body font-normal" /></label><label className="text-body font-medium text-primary">To<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body font-normal" /></label><div className="flex items-end"><Button onClick={load} disabled={loading} className="w-full"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Generate</Button></div></div></Card>

    {loading ? <Card><div className="py-16 text-center text-secondary" data-tour="reports-results"><Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-accent" />Generating report…</div></Card> : <Card title={selected?.label || "Report results"} actions={<span className="text-small text-muted">{rows.length} rows</span>}><div className="overflow-x-auto" data-tour="reports-results"><table className="w-full text-left text-body"><thead className="bg-canvas text-small text-secondary"><tr>{columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}</tr></thead><tbody className="divide-y divide-border">{rows.map((row, index) => <tr key={row._id || row.id || index}>{columns.map((column) => <td key={column} className="px-4 py-3 whitespace-nowrap">{displayValue(row[column])}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <p className="py-10 text-center text-body text-secondary">No records in this date range.</p>}</div></Card>}
  </div>;
}

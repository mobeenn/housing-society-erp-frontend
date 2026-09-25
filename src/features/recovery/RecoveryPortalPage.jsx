import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, CalendarClock, CheckCircle2, PhoneCall, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../components/common/Table";
import { Button, Card, StatusPill } from "@/components/ui";
import { useCan } from "@/hooks/useCan";
import AddCallDialog from "./components/AddCallDialog";
import {
  getMyPlots,
  getMyRecoveryPerformance,
  getRecoveryConfig,
  getRecoveryPool,
  reserveRecovery,
} from "./recoveryApi";

const currency = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "—";

export default function RecoveryPortalPage() {
  const canEdit = useCan("recovery", "edit");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [performance, setPerformance] = useState(null);
  const [pool, setPool] = useState({ data: [] });
  const [settings, setSettings] = useState({ allowSelfReserve: false });
  const [refreshKey, setRefreshKey] = useState(0);
  const [callTarget, setCallTarget] = useState(null);
  const [loadingPool, setLoadingPool] = useState(false);

  const loadDashboard = async () => {
    try {
      const [result, config] = await Promise.all([getMyRecoveryPerformance(), getRecoveryConfig()]);
      setPerformance(result);
      setSettings(config);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load recovery dashboard");
    }
  };

  const loadPool = async () => {
    if (!settings.allowSelfReserve) return;
    setLoadingPool(true);
    try {
      setPool(await getRecoveryPool({ limit: 20 }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load recovery pool");
    } finally {
      setLoadingPool(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { loadPool(); }, [settings.allowSelfReserve]);

  const refresh = () => {
    setRefreshKey((key) => key + 1);
    loadDashboard();
    loadPool();
  };

  const reserve = async (bookingId) => {
    try {
      await reserveRecovery(bookingId);
      toast.success("Plot reserved");
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reserve plot");
    }
  };

  const plotColumns = [
    { key: "plot", label: "Plot / Booking", sortable: false, render: (row) => <div><p className="font-medium text-primary">{row.plotRef?.plotNumber || "—"}</p><p className="text-small text-muted">{row.booking}</p></div> },
    { key: "member", label: "Member", sortable: false, render: (row) => row.memberRef?.name || "—" },
    { key: "outstanding", label: "Outstanding", sortable: false, render: (row) => currency.format(Number(row.outstandingAmount || 0)) },
    { key: "recovery", label: "Recovery %", sortable: false, render: (row) => `${Number(row.recoveryPercent || 0).toFixed(1)}%` },
    { key: "days", label: "Overdue Days", sortable: false, render: (row) => row.daysOverdue || 0 },
    { key: "status", label: "Status", sortable: false, render: (row) => <StatusPill status={row.status} /> },
    { key: "action", label: "Action", sortable: false, render: (row) => canEdit ? <Button size="sm" variant="outline" onClick={() => setCallTarget(row)}><PhoneCall className="h-3.5 w-3.5" /> Log Call</Button> : <span className="text-small text-muted">View only</span> },
  ];

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "plots", label: "My Plots", icon: PhoneCall },
    { id: "commitments", label: "My Commitments", icon: CalendarClock },
    { id: "performance", label: "My Performance", icon: CheckCircle2 },
  ];

  return (
    <div data-tour="recovery-page-intro" className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div data-tour="recovery-title"><h1 className="text-h1 font-bold text-primary">Recovery Portal</h1><p className="mt-1 text-body text-secondary">Your assigned plots, calls, and collection commitments.</p></div>
        <div data-tour="recovery-actions" className="flex flex-wrap gap-2"><Link to="/recovery/overdue"><Button variant="outline">Overdue Installments</Button></Link><Button variant="outline" onClick={refresh}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>
      </div>
      <div data-tour="recovery-work-area" className="flex gap-2 overflow-x-auto border-b border-border">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-body font-medium ${activeTab === id ? "border-accent text-accent" : "border-transparent text-secondary"}`}><Icon className="h-4 w-4" />{label}</button>)}
      </div>

      {activeTab === "dashboard" && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Assigned Plots" value={performance?.summary?.assignedPlots || 0} />
        <Kpi label="Calls Made" value={performance?.summary?.callsMade || 0} />
        <Kpi label="Amount Recovered" value={currency.format(performance?.summary?.amountRecovered || 0)} />
        <Kpi label="Commitments Kept" value={`${performance?.summary?.commitmentsKept || 0}/${performance?.summary?.commitments || 0}`} />
      </div>}

      {activeTab === "plots" && <div className="space-y-5">
        <Table columns={plotColumns} fetchFn={getMyPlots} filters={{ refreshKey }} searchPlaceholder="Search assigned plots or members..." emptyMessage="No recovery plots assigned" />
        {settings.allowSelfReserve && <Card title="Free Pool"><div className="flex items-center justify-between gap-3"><p className="text-body text-secondary">Reserve an unassigned overdue booking for yourself.</p><Button size="sm" variant="outline" onClick={loadPool} disabled={loadingPool}>Refresh Pool</Button></div><div className="mt-3 space-y-2">{pool.data.map((row) => <div key={row.bookingId} className="flex items-center justify-between rounded-control border border-border px-3 py-2"><div><p className="text-body font-medium text-primary">{row.plot?.plotNumber || row.plotRef?.plotNumber || row.bookingId}</p><p className="text-small text-secondary">{row.member?.name || row.memberRef?.name || "Member"} · {row.daysOverdue} days overdue</p></div>{canEdit && <Button size="sm" onClick={() => reserve(row.bookingId)}>Reserve</Button>}</div>)}{pool.data.length === 0 && <p className="py-5 text-center text-body text-muted">No free recovery plots available.</p>}</div></Card>}
      </div>}

      {activeTab === "commitments" && <Card title="My Commitments"><div className="space-y-3">{performance?.commitments?.length ? performance.commitments.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border px-3 py-3"><div><p className="text-body font-medium text-primary">{item.outcome}</p><p className="text-small text-secondary">Due {formatDate(item.commitmentDate)} · {item.notes || "No notes"}</p></div><div className="text-right"><p className="text-body font-medium text-primary">{item.commitmentAmount ? currency.format(item.commitmentAmount) : "—"}</p><StatusPill status={item.kept ? "Resolved" : "Pending"} /></div></div>) : <p className="py-6 text-center text-body text-muted">No commitments recorded.</p>}</div></Card>}

      {activeTab === "performance" && <Card title="My Performance"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Kpi label="Assigned" value={performance?.summary?.assignedPlots || 0} /><Kpi label="Calls" value={performance?.summary?.callsMade || 0} /><Kpi label="Recovered" value={currency.format(performance?.summary?.amountRecovered || 0)} /><Kpi label="Outstanding" value={currency.format(performance?.summary?.outstandingAmount || 0)} /></div></Card>}

      <AddCallDialog key={callTarget?._id || "closed"} isOpen={Boolean(callTarget)} onClose={() => setCallTarget(null)} assignment={callTarget} onSaved={refresh} />
    </div>
  );
}

function Kpi({ label, value }) {
  return <Card><p className="text-small font-medium tracking-wide text-secondary">{label}</p><p className="mt-2 text-h1 font-bold text-primary">{value}</p></Card>;
}

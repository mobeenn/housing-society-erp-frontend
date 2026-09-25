import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, PhoneCall, RefreshCw, ShieldAlert, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Card, Input, StatusPill } from "@/components/ui";
import { useCan } from "@/hooks/useCan";
import AddCallDialog from "./components/AddCallDialog";
import {
  assignRecovery,
  exportOverdueRecovery,
  getRecoveryAgents,
  getRecoveryAssignments,
  getRecoveryPool,
  getTeamRecoveryPerformance,
  runRecoveryAutoBlock,
} from "./recoveryApi";

const currency = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
export default function RecoveryAdminPage() {
  const canEdit = useCan("recovery", "edit");
  const canExport = useCan("recovery", "export");
  const [tab, setTab] = useState("assign");
  const [pool, setPool] = useState({ data: [] });
  const [agents, setAgents] = useState([]);
  const [assignments, setAssignments] = useState({ data: [] });
  const [team, setTeam] = useState(null);
  const [agentId, setAgentId] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [callTarget, setCallTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [poolResult, agentResult, assignmentResult, teamResult] = await Promise.all([
        getRecoveryPool({ limit: 100, search }),
        getRecoveryAgents(),
        getRecoveryAssignments({ limit: 100 }),
        getTeamRecoveryPerformance(),
      ]);
      setPool(poolResult);
      setAgents(agentResult);
      setAssignments(assignmentResult);
      setTeam(teamResult);
      if (!agentId && agentResult[0]) setAgentId(agentResult[0]._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load recovery administration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [search]);

  const refresh = () => { setSelected(new Set()); load(); };
  const toggle = (id) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  const assignSelected = async () => {
    if (!agentId || selected.size === 0) {
      toast.error("Select at least one plot and an agent");
      return;
    }
    try {
      const result = await assignRecovery({ agentId, bookingIds: [...selected] });
      toast.success(`${result.assigned.length} plot(s) assigned`);
      if (result.skipped.length) toast.info(`${result.skipped.length} skipped`);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to assign recovery plots");
    }
  };

  const exportOverdue = async () => {
    try {
      const blob = await exportOverdueRecovery({});
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "recovery-overdue.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to export overdue installments");
    }
  };

  const runAutoBlock = async () => {
    try {
      const result = await runRecoveryAutoBlock();
      toast.success(`Auto-block check complete: ${result.blocked} newly blocked`);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to run auto-block check");
    }
  };

  const tabs = useMemo(() => [
    { id: "assign", label: "Assign Plots" },
    { id: "commitments", label: "Team Commitments" },
    { id: "performance", label: "Team Performance Reports" },
  ], []);

  return (
    <div data-tour="recovery-page-intro" className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div data-tour="recovery-title"><h1 className="text-h1 font-bold text-primary">Recovery Administration</h1><p className="mt-1 text-body text-secondary">Assign overdue plots, coordinate agents, and monitor collection performance.</p></div><div data-tour="recovery-actions" className="flex flex-wrap gap-2"><Button variant="outline" onClick={refresh}><RefreshCw className="h-4 w-4" /> Refresh</Button><Link to="/recovery/overdue"><Button variant="outline">Overdue Installments</Button></Link>{canExport && <Button variant="outline" onClick={exportOverdue}><Download className="h-4 w-4" /> Export Overdue</Button>}</div></div>
      <div data-tour="recovery-work-area" className="flex gap-2 overflow-x-auto border-b border-border">{tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-body font-medium ${tab === item.id ? "border-accent text-accent" : "border-transparent text-secondary"}`}>{item.label}</button>)}</div>

      {tab === "assign" && <div className="space-y-5"><Card title="Assign Recovery Plots"><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1 text-body font-medium text-primary">Agent<select value={agentId} onChange={(event) => setAgentId(event.target.value)} className="mt-1 w-full rounded-control border border-border-strong bg-surface px-3 py-2 text-body font-normal"><option value="">Select an agent</option>{agents.map((agent) => <option key={agent._id} value={agent._id}>{agent.name} ({agent.email})</option>)}</select></label><label className="flex-1 text-body font-medium text-primary">Search pool<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Member, plot, booking..." className="mt-1" /></label><Button onClick={assignSelected} disabled={loading || selected.size === 0}><UserRound className="h-4 w-4" /> Assign {selected.size ? `(${selected.size})` : ""}</Button></div><p className="mt-3 text-small text-secondary">Only unassigned overdue bookings appear in this pool.</p></Card><PoolTable rows={pool.data} selected={selected} onToggle={toggle} /></div>}

      {tab === "commitments" && <Card title="Team Assignments and Commitments"><AssignmentTable rows={assignments.data} canEdit={canEdit} onCall={setCallTarget} /></Card>}

      {tab === "performance" && <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Agents" value={team?.summary?.agents || 0} /><Kpi label="Assigned Plots" value={team?.summary?.assignedPlots || 0} /><Kpi label="Calls Made" value={team?.summary?.callsMade || 0} /><Kpi label="Amount Recovered" value={currency.format(team?.summary?.amountRecovered || 0)} /></div><Card title="Agent Performance"><div className="overflow-x-auto"><table className="w-full text-left text-body"><thead className="border-b border-border text-small text-secondary"><tr><th className="px-3 py-3">Agent</th><th className="px-3 py-3">Plots</th><th className="px-3 py-3">Calls</th><th className="px-3 py-3">Recovered</th><th className="px-3 py-3">Commitments Kept</th></tr></thead><tbody className="divide-y divide-border">{(team?.data || []).map((row) => <tr key={row.agent._id}><td className="px-3 py-3 font-medium text-primary">{row.agent.name}<p className="text-small font-normal text-muted">{row.agent.email}</p></td><td className="px-3 py-3">{row.summary.assignedPlots}</td><td className="px-3 py-3">{row.summary.callsMade}</td><td className="px-3 py-3">{currency.format(row.summary.amountRecovered)}</td><td className="px-3 py-3">{row.summary.commitmentsKept}/{row.summary.commitments}</td></tr>)}</tbody></table>{(!team?.data || team.data.length === 0) && <p className="py-8 text-center text-body text-muted">No team performance data yet.</p>}</div></Card><Button variant="outline" onClick={runAutoBlock}><ShieldAlert className="h-4 w-4" /> Run Auto-Block Check</Button></div>}

      <AddCallDialog key={callTarget?._id || "closed"} isOpen={Boolean(callTarget)} onClose={() => setCallTarget(null)} assignment={callTarget} onSaved={refresh} />
    </div>
  );
}

function PoolTable({ rows, selected, onToggle }) {
  return <Card title={`Free Pool (${rows.length})`}><div className="overflow-x-auto"><table className="w-full text-left text-body"><thead className="border-b border-border text-small text-secondary"><tr><th className="w-10 px-3 py-3" /><th className="px-3 py-3">Member / Plot</th><th className="px-3 py-3">Outstanding</th><th className="px-3 py-3">Overdue Days</th><th className="px-3 py-3">Recovery %</th><th className="px-3 py-3">Blocked</th></tr></thead><tbody className="divide-y divide-border">{rows.map((row) => <tr key={row.bookingId}><td className="px-3 py-3"><input type="checkbox" checked={selected.has(row.bookingId)} onChange={() => onToggle(row.bookingId)} aria-label={`Select booking ${row.bookingId}`} /></td><td className="px-3 py-3"><p className="font-medium text-primary">{row.member?.name || "—"}</p><p className="text-small text-muted">{row.plot?.plotNumber || "—"} · {row.bookingId}</p></td><td className="px-3 py-3">{currency.format(row.outstandingAmount)}</td><td className="px-3 py-3">{row.daysOverdue}</td><td className="px-3 py-3">{Number(row.recoveryPercent).toFixed(1)}%</td><td className="px-3 py-3">{row.isBlocked ? <StatusPill status="Blocked" /> : "—"}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="py-8 text-center text-body text-muted">No unassigned overdue bookings.</p>}</div></Card>;
}

function AssignmentTable({ rows, canEdit, onCall }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-body"><thead className="border-b border-border text-small text-secondary"><tr><th className="px-3 py-3">Agent / Plot</th><th className="px-3 py-3">Outstanding</th><th className="px-3 py-3">Recovery %</th><th className="px-3 py-3">Calls</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th></tr></thead><tbody className="divide-y divide-border">{rows.map((row) => <tr key={row._id}><td className="px-3 py-3"><p className="font-medium text-primary">{row.agentRef?.name || "—"}</p><p className="text-small text-muted">{row.plotRef?.plotNumber || row.booking} · {row.memberRef?.name || "—"}</p></td><td className="px-3 py-3">{currency.format(row.outstandingAmount)}</td><td className="px-3 py-3">{Number(row.recoveryPercent || 0).toFixed(1)}%</td><td className="px-3 py-3">{row.callCount || 0}</td><td className="px-3 py-3"><StatusPill status={row.status} /></td><td className="px-3 py-3">{canEdit && row.status !== "Resolved" && <Button size="sm" variant="outline" onClick={() => onCall(row)}><PhoneCall className="h-3.5 w-3.5" /> Call</Button>}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="py-8 text-center text-body text-muted">No recovery assignments yet.</p>}</div>;
}

function Kpi({ label, value }) {
  return <Card><p className="text-small font-medium tracking-wide text-secondary">{label}</p><p className="mt-2 text-h1 font-bold text-primary">{value}</p></Card>;
}

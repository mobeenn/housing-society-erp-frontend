import { useEffect, useState } from "react";
import { Check, LogIn, LogOut, Plus, RefreshCw, UserRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button, Card, Input } from "@/components/ui";
import Modal from "@/components/ui/Modal";
import { useCan } from "@/hooks/useCan";
import { checkInAppointment, checkOutAppointment, createAppointment, getTodaysAppointments, listAppointmentHosts } from "./appointmentsApi";
import { lifecycleStatusClass } from "@/features/lifecycle/confirmation";

const emptyForm = { visitorName: "", purpose: "", hostEmployee: "" };

export default function TodayPage() {
  const [appointments, setAppointments] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const canCreate = useCan("appointments", "create");
  const canEdit = useCan("appointments", "edit");

  const load = async () => {
    setLoading(true);
    try { const [rows, hostRows] = await Promise.all([getTodaysAppointments(), listAppointmentHosts()]); setAppointments(rows || []); setHosts(hostRows || []); }
    catch (error) { toast.error(error.response?.data?.message || "Failed to load today's appointments"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const add = async () => { if (!form.visitorName || !form.purpose || !form.hostEmployee) { toast.error("Complete all appointment fields"); return; } setSaving(true); try { await createAppointment(form); toast.success("Walk-in appointment created"); setModalOpen(false); setForm(emptyForm); await load(); } catch (error) { toast.error(error.response?.data?.message || "Failed to create appointment"); } finally { setSaving(false); } };
  const transition = async (appointment, action) => { try { if (action === "in") await checkInAppointment(appointment._id); else await checkOutAppointment(appointment._id); toast.success(action === "in" ? "Visitor checked in" : "Visitor checked out"); await load(); } catch (error) { toast.error(error.response?.data?.message || "Appointment update failed"); } };

  return <div className="space-y-5" data-tour="appointments-today-page"><Card title="Today's Queue" actions={<><Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>{canCreate && <Button data-tour="appointments-walkin" size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Walk-in</Button>}</>}><p className="text-body text-secondary" data-tour="appointments-queue">Visitors are separate from gate-security visitor records.</p></Card>{loading ? <Card><p className="py-8 text-center text-body text-secondary">Loading queue...</p></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{appointments.map((appointment) => <Card key={appointment._id}><div className="flex items-start justify-between gap-3"><div><p className="text-h2 font-bold text-accent">{appointment.tokenNumber}</p><p className="font-medium text-primary">{appointment.visitorName}</p><p className="mt-1 text-body text-secondary">{appointment.purpose}</p><p className="mt-2 text-small text-secondary">Host: {appointment.hostEmployeeRef?.name || "—"}</p></div><span className={`rounded-full px-2 py-1 text-small font-medium ${lifecycleStatusClass(appointment.status)}`}>{appointment.status}</span></div><div className="mt-4 flex gap-2">{canEdit && appointment.status === "Waiting" && <Button data-tour="appointments-transitions" size="sm" onClick={() => transition(appointment, "in")}><LogIn className="h-4 w-4" /> Check in</Button>}{canEdit && appointment.status === "InMeeting" && <Button data-tour="appointments-transitions" size="sm" onClick={() => transition(appointment, "out")}><LogOut className="h-4 w-4" /> Check out</Button>}{appointment.status === "Done" && <span className="flex items-center gap-1 text-small text-success"><Check className="h-4 w-4" /> Visit complete</span>}</div></Card>)}{appointments.length === 0 && <Card><div className="py-10 text-center"><UserRound className="mx-auto mb-2 h-9 w-9 text-muted" /><p className="text-body text-secondary">No appointments scheduled for today.</p></div></Card>}</div>}
    <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title="Add Walk-in Appointment"><div className="space-y-4" data-tour="appointments-create-form"><Input label="Visitor name" value={form.visitorName} onChange={(event) => update("visitorName", event.target.value)} placeholder="Business visitor name" /><Input label="Purpose" value={form.purpose} onChange={(event) => update("purpose", event.target.value)} placeholder="Meeting purpose" /><label className="block text-body font-medium text-primary">Host employee<select value={form.hostEmployee} onChange={(event) => update("hostEmployee", event.target.value)} className="mt-1 w-full rounded-control border border-border-strong px-3 py-2 text-body"><option value="">Select host</option>{hosts.map((host) => <option key={host._id} value={host._id}>{host.name} ({host.employeeId})</option>)}</select></label><div className="flex justify-end gap-2 border-t border-border pt-4"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={add} isLoading={saving}>Create token</Button></div></div></Modal>
  </div>;
}

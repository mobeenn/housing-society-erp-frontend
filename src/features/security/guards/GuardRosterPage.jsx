import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import StatusPill from "@/components/ui/StatusPill";
import { getUsers } from "@/features/users-roles/usersRolesApi";
import {
  assignRoster,
  createGuard,
  getGuards,
  getRoster,
  markAttendance,
  updateGuard,
} from "../securityApi";

const SHIFTS = ["Morning", "Evening", "Night"];
const GUARD_STATUSES = ["Active", "Inactive", "Suspended"];
const ATTENDANCE_STATUSES = ["Present", "Absent", "Leave"];

// Helper to get Monday of the given date's week
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Format Date object to YYYY-MM-DD
function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function GuardRosterPage() {
  const [activeTab, setActiveTab] = useState("roster"); // "roster" | "guards"

  // Guards State
  const [guards, setGuards] = useState([]);
  const [loadingGuards, setLoadingGuards] = useState(true);
  const [guardSearch, setGuardSearch] = useState("");
  const [guardShiftFilter, setGuardShiftFilter] = useState("");
  const [guardStatusFilter, setGuardStatusFilter] = useState("");
  const [showGuardModal, setShowGuardModal] = useState(false);
  const [editingGuard, setEditingGuard] = useState(null);
  const [savingGuard, setSavingGuard] = useState(false);
  const [usersList, setUsersList] = useState([]);

  // Roster State
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getMonday(new Date()),
  );
  const [rosterData, setRosterData] = useState([]);
  const [rosterSummary, setRosterSummary] = useState({});
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [rosterGuardFilter, setRosterGuardFilter] = useState("");

  // Assign Shift Modal
  const [assignModal, setAssignModal] = useState({
    open: false,
    guard: null,
    date: "",
    shift: "Morning",
  });
  const [savingAssign, setSavingAssign] = useState(false);

  // Form State for Guard Create/Edit
  const [guardForm, setGuardForm] = useState({
    name: "",
    phone: "",
    shift: "Morning",
    status: "Active",
    supervisor: "",
    user: "",
  });

  // Calculate 7 days of the week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return {
      dateStr: formatDate(d),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      isToday: formatDate(d) === formatDate(new Date()),
    };
  });

  const weekFromStr = weekDays[0].dateStr;
  const weekToStr = weekDays[6].dateStr;

  // Load Guards
  const loadGuards = useCallback(() => {
    setLoadingGuards(true);
    const params = {};
    if (guardShiftFilter) params.shift = guardShiftFilter;
    if (guardStatusFilter) params.status = guardStatusFilter;
    if (guardSearch) params.q = guardSearch;

    return getGuards(params)
      .then((res) => setGuards(res.data || res || []))
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to load guards"),
      )
      .finally(() => setLoadingGuards(false));
  }, [guardShiftFilter, guardStatusFilter, guardSearch]);

  // Load Roster
  const loadRoster = useCallback(() => {
    setLoadingRoster(true);
    const params = {
      from: weekFromStr,
      to: weekToStr,
    };
    if (rosterGuardFilter) params.guard = rosterGuardFilter;

    return getRoster(params)
      .then((res) => {
        setRosterData(res.data || []);
        setRosterSummary(res.summary || {});
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Failed to load roster"),
      )
      .finally(() => setLoadingRoster(false));
  }, [weekFromStr, weekToStr, rosterGuardFilter]);

  useEffect(() => {
    loadGuards();
  }, [loadGuards]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  useEffect(() => {
    getUsers({ page: 1, limit: 100 })
      .then((res) => setUsersList(res.users || res.data || []))
      .catch(() => setUsersList([]));
  }, []);

  // Week Navigation
  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const resetToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Open Add/Edit Guard
  const handleOpenGuardModal = (guard = null) => {
    if (guard) {
      setEditingGuard(guard);
      setGuardForm({
        name: guard.name || "",
        phone: guard.phone || "",
        shift: guard.shift || "Morning",
        status: guard.status || "Active",
        supervisor: guard.supervisor || "",
        user: guard.user || "",
      });
    } else {
      setEditingGuard(null);
      setGuardForm({
        name: "",
        phone: "",
        shift: "Morning",
        status: "Active",
        supervisor: "",
        user: "",
      });
    }
    setShowGuardModal(true);
  };

  // Save Guard
  const handleSaveGuard = async (e) => {
    e.preventDefault();
    if (!guardForm.name.trim()) {
      toast.error("Guard name is required");
      return;
    }
    setSavingGuard(true);
    try {
      const payload = {
        name: guardForm.name.trim(),
        phone: guardForm.phone?.trim() || null,
        shift: guardForm.shift,
        status: guardForm.status,
        supervisor: guardForm.supervisor || null,
        user: guardForm.user || null,
      };

      if (editingGuard) {
        await updateGuard(editingGuard._id, payload);
        toast.success("Guard updated successfully");
      } else {
        await createGuard(payload);
        toast.success("Guard created successfully");
      }
      setShowGuardModal(false);
      loadGuards();
      loadRoster();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save guard");
    } finally {
      setSavingGuard(false);
    }
  };

  // Handle Mark Attendance
  const handleMarkAttendance = async (guardId, date, attendanceStatus) => {
    try {
      await markAttendance({
        guard: guardId,
        date,
        attendanceStatus,
      });
      toast.success(`Marked as ${attendanceStatus}`);
      loadRoster();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  // Handle Save Shift Assignment
  const handleSaveAssign = async (e) => {
    e.preventDefault();
    if (!assignModal.guard || !assignModal.date) return;
    setSavingAssign(true);
    try {
      await assignRoster({
        guard: assignModal.guard._id,
        date: assignModal.date,
        shift: assignModal.shift,
      });
      toast.success("Shift assigned");
      setAssignModal({ open: false, guard: null, date: "", shift: "Morning" });
      loadRoster();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign shift");
    } finally {
      setSavingAssign(false);
    }
  };

  // Map entries by guardId -> dateStr for calendar matrix
  const rosterMap = {};
  rosterData.forEach((entry) => {
    const key = `${entry.guard}_${entry.date}`;
    rosterMap[key] = entry;
  });

  return (
    <div className="space-y-6" data-tour="security-guards-page">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1 font-bold tracking-tight text-primary" data-tour="security-guards-heading">
            Security & Guard Roster
          </h1>
          <p className="text-body text-secondary">
            Manage security personnel, weekly duty shifts, and mark daily attendance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-tour="security-guards-add"
            onClick={() => handleOpenGuardModal()}
            className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent shadow-none hover:bg-accent transition"
          >
            <Plus className="h-4 w-4" />
            Add Guard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border" data-tour="security-guards-tabs">
        <button
          onClick={() => setActiveTab("roster")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-body font-medium transition-colors duration-base ${
            activeTab === "roster"
              ? "border-accent text-accent"
              : "border-transparent text-secondary hover:text-primary hover:border-border-strong"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Duty Roster & Attendance
        </button>
        <button
          onClick={() => setActiveTab("guards")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-body font-medium transition-colors duration-base ${
            activeTab === "guards"
              ? "border-accent text-accent"
              : "border-transparent text-secondary hover:text-primary hover:border-border-strong"
          }`}
        >
          <Users className="h-4 w-4" />
          Guard Directory ({guards.length})
        </button>
      </div>

      {/* ==================== TAB 1: DUTY ROSTER & ATTENDANCE ==================== */}
      {activeTab === "roster" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-card border border-border bg-surface p-4 shadow-none">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-control bg-success-soft text-success">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-small font-medium text-secondary">Present (Week)</p>
                  <p className="text-h2 font-bold text-primary">
                    {rosterSummary.Present || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-card border border-border bg-surface p-4 shadow-none">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-control bg-danger-soft text-danger">
                  <UserX className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-small font-medium text-secondary">Absent (Week)</p>
                  <p className="text-h2 font-bold text-primary">
                    {rosterSummary.Absent || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-card border border-border bg-surface p-4 shadow-none">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-control bg-warning-soft text-warning">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-small font-medium text-secondary">On Leave (Week)</p>
                  <p className="text-h2 font-bold text-primary">
                    {rosterSummary.Leave || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-card border border-border bg-surface p-4 shadow-none">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-control bg-surface-muted text-secondary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-small font-medium text-secondary">Total Guards</p>
                  <p className="text-h2 font-bold text-primary">
                    {guards.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Roster Controls: Week Navigation & Filter */}
          <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-none md:flex-row md:items-center md:justify-between" data-tour="security-guards-roster-controls">
            {/* Week navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevWeek}
                className="rounded-control border border-border p-2 text-secondary hover:bg-canvas"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={resetToday}
                className="rounded-control border border-border px-3 py-1.5 text-small font-medium text-primary hover:bg-canvas"
              >
                Current Week
              </button>
              <button
                onClick={nextWeek}
                className="rounded-control border border-border p-2 text-secondary hover:bg-canvas"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="ml-2 text-body font-semibold text-primary">
                {weekDays[0].month} {weekDays[0].dayNum} – {weekDays[6].month}{" "}
                {weekDays[6].dayNum}, {currentWeekStart.getFullYear()}
              </span>
            </div>

            {/* Filter by Guard */}
            <div className="flex items-center gap-3">
              <select
                value={rosterGuardFilter}
                onChange={(e) => setRosterGuardFilter(e.target.value)}
                className="rounded-control border border-border-strong px-3 py-1.5 text-body text-primary focus:border-accent focus:outline-none"
              >
                <option value="">All Guards</option>
                {guards.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name} ({g.shift})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Roster Calendar Table */}
          <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-none" data-tour="security-guards-roster">
            <table className="w-full border-collapse text-left text-body">
              <thead>
                <tr className="border-b border-border bg-canvas text-small font-semibold text-secondary">
                  <th className="sticky left-0 z-10 bg-canvas p-3 min-w-[200px] border-r border-border">
                    Guard & Default Shift
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.dateStr}
                      className={`p-3 text-center min-w-[140px] border-r border-border last:border-r-0 ${
                        day.isToday ? "bg-gold-soft text-accent" : ""
                      }`}
                    >
                      <div className="font-bold">{day.dayName}</div>
                      <div
                        className={`text-small ${
                          day.isToday ? "text-accent font-semibold" : "text-muted"
                        }`}
                      >
                        {day.month} {day.dayNum}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingRoster || loadingGuards ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted">
                      Loading duty roster...
                    </td>
                  </tr>
                ) : guards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted">
                      No guards added yet. Click &quot;Add Guard&quot; to begin.
                    </td>
                  </tr>
                ) : (
                  guards
                    .filter((g) =>
                      rosterGuardFilter ? g._id === rosterGuardFilter : true,
                    )
                    .map((guard) => (
                      <tr key={guard._id} className="hover:bg-canvas/50">
                        {/* Guard Name & Info */}
                        <td className="sticky left-0 z-10 bg-surface p-3 border-r border-border shadow-none">
                          <div className="font-medium text-primary">
                            {guard.name}
                          </div>
                          <div className="flex items-center gap-2 text-small text-secondary mt-0.5">
                            <span className="rounded-control bg-surface-muted px-1.5 py-0.5 font-medium text-primary">
                              {guard.shift}
                            </span>
                            {guard.phone && <span>{guard.phone}</span>}
                          </div>
                        </td>

                        {/* Day Cells */}
                        {weekDays.map((day) => {
                          const key = `${guard._id}_${day.dateStr}`;
                          const entry = rosterMap[key];
                          const currentShift = entry?.shift || guard.shift;
                          const attendance = entry?.attendanceStatus;

                          return (
                            <td
                              key={day.dateStr}
                              className={`p-2.5 text-center border-r border-border last:border-r-0 align-top ${
                                day.isToday ? "bg-gold-soft/30" : ""
                              }`}
                            >
                              <div className="flex flex-col items-center gap-1.5">
                                {/* Shift Badge (Clickable to change shift) */}
                                <button
                                  onClick={() =>
                                    setAssignModal({
                                      open: true,
                                      guard,
                                      date: day.dateStr,
                                      shift: currentShift,
                                    })
                                  }
                                  className={`text-small px-2 py-0.5 rounded-full font-medium transition-colors duration-base ${
                                    currentShift === "Morning"
                                      ? "bg-warning-soft text-warning hover:bg-warning-soft"
                                      : currentShift === "Evening"
                                      ? "bg-info-soft text-info hover:bg-info-soft"
                                      : "bg-info-soft text-info hover:bg-info-soft"
                                  }`}
                                  title="Click to change shift for this date"
                                >
                                  {currentShift}
                                </button>

                                {/* Attendance Status Dropdown / Action */}
                                <div className="mt-1 flex items-center justify-center">
                                  {attendance === "Present" && (
                                    <span className="inline-flex items-center gap-1 rounded-control bg-success-soft px-2 py-0.5 text-small font-semibold text-success">
                                      ✓ Present
                                    </span>
                                  )}
                                  {attendance === "Absent" && (
                                    <span className="inline-flex items-center gap-1 rounded-control bg-danger-soft px-2 py-0.5 text-small font-semibold text-danger">
                                      ✗ Absent
                                    </span>
                                  )}
                                  {attendance === "Leave" && (
                                    <span className="inline-flex items-center gap-1 rounded-control bg-warning-soft px-2 py-0.5 text-small font-semibold text-warning">
                                      ⏱ Leave
                                    </span>
                                  )}
                                  {!attendance && (
                                    <span className="text-small text-muted italic">
                                      Unmarked
                                    </span>
                                  )}
                                </div>

                                {/* Quick Mark Buttons */}
                                <div className="mt-1 flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      handleMarkAttendance(
                                        guard._id,
                                        day.dateStr,
                                        "Present",
                                      )
                                    }
                                    className="rounded-control p-1 text-small text-success hover:bg-success-soft"
                                    title="Mark Present"
                                  >
                                    P
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleMarkAttendance(
                                        guard._id,
                                        day.dateStr,
                                        "Absent",
                                      )
                                    }
                                    className="rounded-control p-1 text-small text-danger hover:bg-danger-soft"
                                    title="Mark Absent"
                                  >
                                    A
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleMarkAttendance(
                                        guard._id,
                                        day.dateStr,
                                        "Leave",
                                      )
                                    }
                                    className="rounded-control p-1 text-small text-warning hover:bg-warning-soft"
                                    title="Mark Leave"
                                  >
                                    L
                                  </button>
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: GUARD DIRECTORY ==================== */}
      {activeTab === "guards" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-card border border-border bg-surface p-4 shadow-none">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                value={guardSearch}
                onChange={(e) => setGuardSearch(e.target.value)}
                placeholder="Search by name, phone..."
                className="w-full rounded-control border border-border-strong pl-9 pr-3 py-1.5 text-body focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={guardShiftFilter}
                onChange={(e) => setGuardShiftFilter(e.target.value)}
                className="rounded-control border border-border-strong px-3 py-1.5 text-body text-primary focus:border-accent focus:outline-none"
              >
                <option value="">All Shifts</option>
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    {s} Shift
                  </option>
                ))}
              </select>

              <select
                value={guardStatusFilter}
                onChange={(e) => setGuardStatusFilter(e.target.value)}
                className="rounded-control border border-border-strong px-3 py-1.5 text-body text-primary focus:border-accent focus:outline-none"
              >
                <option value="">All Statuses</option>
                {GUARD_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Guards Table */}
          <div className="overflow-hidden rounded-card border border-border bg-surface shadow-none">
            <table className="w-full text-left text-body">
              <thead className="border-b border-border bg-canvas text-small font-semibold text-secondary">
                <tr>
                  <th className="p-4">Guard Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Default Shift</th>
                  <th className="p-4">Supervisor</th>
                  <th className="p-4">User Account</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingGuards ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted">
                      Loading guards...
                    </td>
                  </tr>
                ) : guards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted">
                      No guards found.
                    </td>
                  </tr>
                ) : (
                  guards.map((guard) => (
                    <tr key={guard._id} className="hover:bg-canvas">
                      <td className="p-4 font-medium text-primary">
                        {guard.name}
                      </td>
                      <td className="p-4 text-secondary">
                        {guard.phone || "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-small font-medium ${
                            guard.shift === "Morning"
                              ? "bg-warning-soft text-warning"
                              : guard.shift === "Evening"
                              ? "bg-info-soft text-info"
                              : "bg-info-soft text-info"
                          }`}
                        >
                          {guard.shift}
                        </span>
                      </td>
                      <td className="p-4 text-secondary">
                        {guard.supervisorRef?.name || "—"}
                      </td>
                      <td className="p-4 text-secondary">
                        {guard.userRef?.email || "No Login"}
                      </td>
                      <td className="p-4">
                        <StatusPill status={guard.status} />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenGuardModal(guard)}
                          className="text-small font-medium text-accent hover:text-accent"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD / EDIT GUARD ==================== */}
      {showGuardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-overlay animate-in fade-in">
            <h2 className="text-h2 font-bold text-primary mb-4">
              {editingGuard ? "Edit Security Guard" : "Add Security Guard"}
            </h2>
            <form onSubmit={handleSaveGuard} className="space-y-4">
              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={guardForm.name}
                  onChange={(e) =>
                    setGuardForm({ ...guardForm, name: e.target.value })
                  }
                  required
                  placeholder="e.g. Muhammad Ali"
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={guardForm.phone}
                  onChange={(e) =>
                    setGuardForm({ ...guardForm, phone: e.target.value })
                  }
                  placeholder="e.g. +92 300 1234567"
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Default Shift *
                  </label>
                  <select
                    value={guardForm.shift}
                    onChange={(e) =>
                      setGuardForm({ ...guardForm, shift: e.target.value })
                    }
                    className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                  >
                    {SHIFTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-small font-medium text-primary mb-1">
                    Status *
                  </label>
                  <select
                    value={guardForm.status}
                    onChange={(e) =>
                      setGuardForm({ ...guardForm, status: e.target.value })
                    }
                    className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                  >
                    {GUARD_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Supervisor (User)
                </label>
                <select
                  value={guardForm.supervisor}
                  onChange={(e) =>
                    setGuardForm({ ...guardForm, supervisor: e.target.value })
                  }
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                >
                  <option value="">None / Unassigned</option>
                  {usersList.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Linked System Login (Optional)
                </label>
                <select
                  value={guardForm.user}
                  onChange={(e) =>
                    setGuardForm({ ...guardForm, user: e.target.value })
                  }
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                >
                  <option value="">No Login Account</option>
                  {usersList.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGuardModal(false)}
                  className="rounded-control border border-border-strong px-4 py-2 text-body font-medium text-primary hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGuard}
                  className="rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent hover:bg-accent disabled:opacity-50"
                >
                  {savingGuard ? "Saving..." : editingGuard ? "Update Guard" : "Create Guard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ASSIGN SHIFT FOR DATE ==================== */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="w-full max-w-sm rounded-card bg-surface p-6 shadow-overlay animate-in fade-in">
            <h2 className="text-h2 font-bold text-primary mb-2">
              Assign Shift
            </h2>
            <p className="text-small text-secondary mb-4">
              Set shift for <span className="font-semibold text-primary">{assignModal.guard?.name}</span> on{" "}
              <span className="font-semibold text-primary">{assignModal.date}</span>.
            </p>
            <form onSubmit={handleSaveAssign} className="space-y-4">
              <div>
                <label className="block text-small font-medium text-primary mb-1">
                  Shift
                </label>
                <select
                  value={assignModal.shift}
                  onChange={(e) =>
                    setAssignModal({ ...assignModal, shift: e.target.value })
                  }
                  className="w-full rounded-control border border-border-strong px-3 py-2 text-body focus:border-accent focus:outline-none"
                >
                  {SHIFTS.map((s) => (
                    <option key={s} value={s}>
                      {s} Shift
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setAssignModal({
                      open: false,
                      guard: null,
                      date: "",
                      shift: "Morning",
                    })
                  }
                  className="rounded-control border border-border-strong px-3 py-1.5 text-body font-medium text-primary hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAssign}
                  className="rounded-control bg-accent px-4 py-1.5 text-body font-medium text-on-accent hover:bg-accent disabled:opacity-50"
                >
                  {savingAssign ? "Saving..." : "Save Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

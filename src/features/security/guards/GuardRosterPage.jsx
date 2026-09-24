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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900" data-tour="security-guards-heading">
            Security & Guard Roster
          </h1>
          <p className="text-sm text-neutral-500">
            Manage security personnel, weekly duty shifts, and mark daily attendance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-tour="security-guards-add"
            onClick={() => handleOpenGuardModal()}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add Guard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200" data-tour="security-guards-tabs">
        <button
          onClick={() => setActiveTab("roster")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === "roster"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Duty Roster & Attendance
        </button>
        <button
          onClick={() => setActiveTab("guards")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === "guards"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
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
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500">Present (Week)</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {rosterSummary.Present || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <UserX className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500">Absent (Week)</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {rosterSummary.Absent || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500">On Leave (Week)</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {rosterSummary.Leave || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500">Total Guards</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {guards.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Roster Controls: Week Navigation & Filter */}
          <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between" data-tour="security-guards-roster-controls">
            {/* Week navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevWeek}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={resetToday}
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Current Week
              </button>
              <button
                onClick={nextWeek}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="ml-2 text-sm font-semibold text-neutral-800">
                {weekDays[0].month} {weekDays[0].dayNum} – {weekDays[6].month}{" "}
                {weekDays[6].dayNum}, {currentWeekStart.getFullYear()}
              </span>
            </div>

            {/* Filter by Guard */}
            <div className="flex items-center gap-3">
              <select
                value={rosterGuardFilter}
                onChange={(e) => setRosterGuardFilter(e.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 focus:border-primary-500 focus:outline-none"
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
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm" data-tour="security-guards-roster">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="sticky left-0 z-10 bg-neutral-50 p-3 min-w-[200px] border-r border-neutral-200">
                    Guard & Default Shift
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.dateStr}
                      className={`p-3 text-center min-w-[140px] border-r border-neutral-200 last:border-r-0 ${
                        day.isToday ? "bg-primary-50 text-primary-900" : ""
                      }`}
                    >
                      <div className="font-bold">{day.dayName}</div>
                      <div
                        className={`text-xs ${
                          day.isToday ? "text-primary-700 font-semibold" : "text-neutral-400"
                        }`}
                      >
                        {day.month} {day.dayNum}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {loadingRoster || loadingGuards ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-400">
                      Loading duty roster...
                    </td>
                  </tr>
                ) : guards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-400">
                      No guards added yet. Click &quot;Add Guard&quot; to begin.
                    </td>
                  </tr>
                ) : (
                  guards
                    .filter((g) =>
                      rosterGuardFilter ? g._id === rosterGuardFilter : true,
                    )
                    .map((guard) => (
                      <tr key={guard._id} className="hover:bg-neutral-50/50">
                        {/* Guard Name & Info */}
                        <td className="sticky left-0 z-10 bg-white p-3 border-r border-neutral-200 shadow-sm">
                          <div className="font-medium text-neutral-900">
                            {guard.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                            <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-700">
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
                              className={`p-2.5 text-center border-r border-neutral-200 last:border-r-0 align-top ${
                                day.isToday ? "bg-primary-50/30" : ""
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
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium transition ${
                                    currentShift === "Morning"
                                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                      : currentShift === "Evening"
                                      ? "bg-sky-100 text-sky-800 hover:bg-sky-200"
                                      : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                  }`}
                                  title="Click to change shift for this date"
                                >
                                  {currentShift}
                                </button>

                                {/* Attendance Status Dropdown / Action */}
                                <div className="mt-1 flex items-center justify-center">
                                  {attendance === "Present" && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                      ✓ Present
                                    </span>
                                  )}
                                  {attendance === "Absent" && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                                      ✗ Absent
                                    </span>
                                  )}
                                  {attendance === "Leave" && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                      ⏱ Leave
                                    </span>
                                  )}
                                  {!attendance && (
                                    <span className="text-xs text-neutral-400 italic">
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
                                    className="rounded p-1 text-xs text-emerald-600 hover:bg-emerald-50"
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
                                    className="rounded p-1 text-xs text-rose-600 hover:bg-rose-50"
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
                                    className="rounded p-1 text-xs text-amber-600 hover:bg-amber-50"
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={guardSearch}
                onChange={(e) => setGuardSearch(e.target.value)}
                placeholder="Search by name, phone..."
                className="w-full rounded-lg border border-neutral-300 pl-9 pr-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={guardShiftFilter}
                onChange={(e) => setGuardShiftFilter(e.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 focus:border-primary-500 focus:outline-none"
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
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 focus:border-primary-500 focus:outline-none"
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
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
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
              <tbody className="divide-y divide-neutral-200">
                {loadingGuards ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-400">
                      Loading guards...
                    </td>
                  </tr>
                ) : guards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-400">
                      No guards found.
                    </td>
                  </tr>
                ) : (
                  guards.map((guard) => (
                    <tr key={guard._id} className="hover:bg-neutral-50">
                      <td className="p-4 font-medium text-neutral-900">
                        {guard.name}
                      </td>
                      <td className="p-4 text-neutral-600">
                        {guard.phone || "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            guard.shift === "Morning"
                              ? "bg-amber-100 text-amber-800"
                              : guard.shift === "Evening"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {guard.shift}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-600">
                        {guard.supervisorRef?.name || "—"}
                      </td>
                      <td className="p-4 text-neutral-600">
                        {guard.userRef?.email || "No Login"}
                      </td>
                      <td className="p-4">
                        <StatusPill status={guard.status} />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenGuardModal(guard)}
                          className="text-xs font-medium text-primary-600 hover:text-primary-800"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">
              {editingGuard ? "Edit Security Guard" : "Add Security Guard"}
            </h2>
            <form onSubmit={handleSaveGuard} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
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
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={guardForm.phone}
                  onChange={(e) =>
                    setGuardForm({ ...guardForm, phone: e.target.value })
                  }
                  placeholder="e.g. +92 300 1234567"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Default Shift *
                  </label>
                  <select
                    value={guardForm.shift}
                    onChange={(e) =>
                      setGuardForm({ ...guardForm, shift: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    {SHIFTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={guardForm.status}
                    onChange={(e) =>
                      setGuardForm({ ...guardForm, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
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
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Supervisor (User)
                </label>
                <select
                  value={guardForm.supervisor}
                  onChange={(e) =>
                    setGuardForm({ ...guardForm, supervisor: e.target.value })
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
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
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Linked System Login (Optional)
                </label>
                <select
                  value={guardForm.user}
                  onChange={(e) =>
                    setGuardForm({ ...guardForm, user: e.target.value })
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
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
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGuard}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-in fade-in">
            <h2 className="text-lg font-bold text-neutral-900 mb-2">
              Assign Shift
            </h2>
            <p className="text-xs text-neutral-500 mb-4">
              Set shift for <span className="font-semibold text-neutral-800">{assignModal.guard?.name}</span> on{" "}
              <span className="font-semibold text-neutral-800">{assignModal.date}</span>.
            </p>
            <form onSubmit={handleSaveAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Shift
                </label>
                <select
                  value={assignModal.shift}
                  onChange={(e) =>
                    setAssignModal({ ...assignModal, shift: e.target.value })
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
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
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAssign}
                  className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
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

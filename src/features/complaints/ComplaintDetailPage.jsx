import { useEffect, useState } from "react";
import { ArrowLeft, Clock, MessageSquare, Wrench } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import StatusPill from "@/components/ui/StatusPill";
import { administrationApi } from "@/features/settings/administrationApi";
import { getUsers } from "@/features/users-roles/usersRolesApi";
import {
  addComplaintComment,
  assignComplaint,
  changeComplaintStatus,
  getComplaint,
  reopenComplaint,
  resolveComplaint,
} from "./complaintsApi";
import { getWorkOrders } from "@/features/maintenance/maintenanceApi";

export default function ComplaintDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [comment, setComment] = useState("");
  const [assignment, setAssignment] = useState({ department: "", staff: "" });
  const [workOrders, setWorkOrders] = useState([]); // work orders spawned from this complaint
  const [, setTick] = useState(0); // re-render for live SLA countdown

  const load = () =>
    getComplaint(id)
      .then((data) => {
        setComplaint(data);
        setAssignment({
          department: data.assignedDepartment || "",
          staff: data.assignedStaff || "",
        });
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "Failed to load complaint",
        );
        navigate("/complaints");
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    administrationApi
      .getMasterData("departments")
      .then((data) =>
        setDepartments(Array.isArray(data) ? data : data.data || []),
      )
      .catch(() => setDepartments([]));
    getUsers({ page: 1, limit: 100 })
      .then((data) => setUsers(data.users || data.data || []))
      .catch(() => setUsers([]));
    getWorkOrders({ relatedComplaint: id, limit: 50 })
      .then((result) => setWorkOrders(result.data || []))
      .catch(() => setWorkOrders([]));
    const timer = setInterval(() => setTick((value) => value + 1), 30000);
    return () => clearInterval(timer);
  }, [id]);

  const act = async (handler, message) => {
    try {
      const updated = await handler();
      if (updated) setComplaint(updated);
      else await load();
      toast.success(message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const submitAssignment = () =>
    act(
      () =>
        assignComplaint(id, {
          assignedDepartment: assignment.department || undefined,
          assignedStaff: assignment.staff || null,
        }),
      "Complaint assigned",
    );

  const submitComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    await act(() => addComplaintComment(id, comment.trim()), "Comment added");
    setComment("");
  };

  const startWork = () =>
    act(() => changeComplaintStatus(id, "InProgress"), "Work started");

  const resolve = () => {
    const note = window.prompt("Resolution note (required)");
    if (note?.trim()) {
      act(() => resolveComplaint(id, note.trim()), "Complaint resolved");
    }
  };

  const reopen = () => act(() => reopenComplaint(id), "Complaint reopened");

  const close = () =>
    act(() => changeComplaintStatus(id, "Closed"), "Complaint closed");

  if (loading) {
    return (
      <div className="py-16 text-center text-neutral-500">
        Loading complaint...
      </div>
    );
  }
  if (!complaint) return null;

  const remainingMs = complaint.slaDueDate
    ? new Date(complaint.slaDueDate).getTime() - Date.now()
    : null;
  const isOverdue =
    remainingMs !== null &&
    remainingMs < 0 &&
    !["Resolved", "Closed"].includes(complaint.status);
  const slaText =
    remainingMs === null
      ? null
      : isOverdue
        ? `Overdue by ${Math.ceil(Math.abs(remainingMs) / 3600000)}h`
        : `${Math.ceil(remainingMs / 3600000)}h left`;

  const assignable = !["Resolved", "Closed"].includes(complaint.status);

  return (
    <div className="space-y-6" data-tour="complaints-detail-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/complaints")}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900" data-tour="complaints-detail-heading">
                {complaint.complaintNumber || "Complaint"}
              </h1>
              <StatusPill status={complaint.status} />
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {complaint.category} · {complaint.priority} priority ·{" "}
              {complaint.memberRef?.name || "—"}
            </p>
          </div>
        </div>
        {slaText && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
              isOverdue
                ? "bg-danger-600 text-white"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            <Clock className="h-4 w-4" />
            SLA {slaText}
            {complaint.slaDueDate && (
              <span className="font-normal opacity-80">
                (due {new Date(complaint.slaDueDate).toLocaleString()})
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div>
            <h2 className="font-semibold text-neutral-900">Details</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
              {complaint.description}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
            <div>
              <dt className="text-neutral-500">Plot</dt>
              <dd className="font-medium">
                {complaint.plotRef?.plotNumber || "Common area"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Location</dt>
              <dd className="font-medium">{complaint.location || "—"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Filed</dt>
              <dd className="font-medium">
                {new Date(complaint.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Department</dt>
              <dd className="font-medium">
                {complaint.assignedDepartmentRef?.name || "Unassigned"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Staff</dt>
              <dd className="font-medium">
                {complaint.assignedStaffRef?.name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Resolved</dt>
              <dd className="font-medium">
                {complaint.resolvedAt
                  ? new Date(complaint.resolvedAt).toLocaleString()
                  : "—"}
              </dd>
            </div>
          </dl>
          {complaint.resolutionNote && (
            <div className="rounded-lg bg-success-50 p-3 text-sm text-success-800">
              <span className="font-semibold">Resolution: </span>
              {complaint.resolutionNote}
            </div>
          )}

          <div className="border-t border-neutral-200 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                <MessageSquare className="h-4 w-4" /> Comments
              </h3>
              <span className="text-xs text-neutral-400">
                {complaint.comments?.length || 0} messages
              </span>
            </div>
            <div className="space-y-3">
              {(complaint.comments || []).map((item, index) => (
                <div key={index} className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">
                    {item.authorRef?.name || "Staff"} ·{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-neutral-800">{item.text}</p>
                </div>
              ))}
              {(complaint.comments || []).length === 0 && (
                <p className="text-sm text-neutral-400">No comments yet.</p>
              )}
            </div>
            <form onSubmit={submitComment} className="mt-4 flex gap-2" data-tour="complaints-comments">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add a progress comment..."
                className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
              <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">
                Send
              </button>
            </form>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm" data-tour="complaints-assignment">
            <h2 className="mb-4 font-semibold text-neutral-900">Assignment</h2>
            <label className="block text-sm text-neutral-600">
              Department
              <select
                disabled={!assignable}
                value={assignment.department}
                onChange={(event) =>
                  setAssignment((current) => ({
                    ...current,
                    department: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:opacity-60"
              >
                <option value="">Auto (default per category)</option>
                {departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-sm text-neutral-600">
              Staff
              <select
                disabled={!assignable}
                value={assignment.staff}
                onChange={(event) =>
                  setAssignment((current) => ({
                    ...current,
                    staff: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:opacity-60"
              >
                <option value="">Select staff</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>
            {assignable && (
              <button
                onClick={submitAssignment}
                className="mt-4 w-full rounded-lg bg-secondary-600 px-4 py-2 text-sm font-medium text-white"
              >
                {complaint.status === "New" ? "Assign" : "Reassign"}
              </button>
            )}
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm" data-tour="complaints-actions">
            <h2 className="mb-4 font-semibold text-neutral-900">Actions</h2>
            <div className="flex flex-col gap-2">
              {!["Resolved", "Closed"].includes(complaint.status) && (
                <button
                  onClick={() => navigate(`/maintenance/new?complaint=${id}`)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-secondary-600 px-4 py-2 text-sm font-medium text-white"
                >
                  <Wrench className="h-4 w-4" /> Create Work Order
                </button>
              )}
              {complaint.status === "Assigned" && (
                <button
                  onClick={startWork}
                  className="rounded-lg bg-warning-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Start work
                </button>
              )}
              {complaint.status === "InProgress" && (
                <button
                  onClick={resolve}
                  className="rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Resolve
                </button>
              )}
              {complaint.status === "Resolved" && (
                <>
                  <button
                    onClick={reopen}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    Reopen
                  </button>
                  <button
                    onClick={close}
                    className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-600"
                  >
                    Close complaint
                  </button>
                </>
              )}
              {complaint.status === "Reopened" && (
                <button
                  onClick={startWork}
                  className="rounded-lg bg-warning-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Resume work
                </button>
              )}
              {complaint.status === "New" && (
                <p className="text-sm text-neutral-500">
                  Assign the complaint to move it forward.
                </p>
              )}
              {complaint.status === "Closed" && (
                <p className="text-sm text-neutral-500">
                  This complaint is closed.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                <Wrench className="h-4 w-4" /> Work Orders
              </h2>
              <span className="text-xs text-neutral-400">
                {workOrders.length} linked
              </span>
            </div>
            {workOrders.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No work orders spawned from this complaint yet.
              </p>
            ) : (
              <div className="space-y-2">
                {workOrders.map((workOrder) => (
                  <div
                    key={workOrder._id}
                    onClick={() => navigate(`/maintenance/${workOrder._id}`)}
                    className="cursor-pointer rounded-lg border border-neutral-200 p-3 transition hover:border-primary-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-medium text-neutral-800">
                        {workOrder.description}
                      </p>
                      <StatusPill status={workOrder.status} />
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {workOrder.priority} ·{" "}
                      {workOrder.assetRef?.name || "No asset"} ·{" "}
                      {new Date(workOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

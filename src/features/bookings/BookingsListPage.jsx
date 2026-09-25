import { useState } from "react";
import { Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Table from "@/components/common/Table";
import StatusPill from "@/components/ui/StatusPill";
import { BOOKING_STATUSES, getBookings } from "./bookingsApi";

export default function BookingsListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const columns = [
    {
      key: "bookingDate",
      label: "Date",
      render: (row) => new Date(row.bookingDate).toLocaleDateString(),
    },
    {
      key: "member",
      label: "Member",
      render: (row) => row.memberRef?.name || "—",
    },
    {
      key: "plot",
      label: "Plot",
      render: (row) => row.plotRef?.plotNumber || "—",
    },
    {
      key: "price",
      label: "Net payable",
      render: (row) =>
        (
          Number(row.price || 0) -
          Number(row.discount || 0) +
          Number(row.developmentCharges || 0) +
          Number(row.additionalCharges || 0)
        ).toLocaleString(),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <button
          data-tour="bookings-row-actions"
          title="View booking"
          className="rounded-control p-1 text-accent hover:bg-gold-soft"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/bookings/${row._id}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];
  return (
    <div data-tour="bookings-page-intro" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-primary">Bookings</h1>
          <p className="mt-1 text-body text-secondary">
            Review reservations, approvals, and payment schedules.
          </p>
        </div>
        <button
          data-tour="bookings-new"
          onClick={() => navigate("/bookings/new")}
          className="flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-body font-medium text-on-accent"
        >
          <Plus className="h-4 w-4" /> New Booking
        </button>
      </div>
      <div data-tour="bookings-status-filter" className="flex gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-control border border-border-strong px-3 py-2 text-body"
        >
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <Table
        columns={columns}
        fetchFn={getBookings}
        filters={{ status }}
        searchPlaceholder="Search by member, plot, or file number..."
        onRowClick={(row) => navigate(`/bookings/${row._id}`)}
      />
    </div>
  );
}

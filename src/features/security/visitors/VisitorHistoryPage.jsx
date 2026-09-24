import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Clock, Search, Filter, Download } from "lucide-react";
import { listVisitorEntries } from "./visitorsApi";

export default function VisitorHistoryPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    gate: "",
  });

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const params = { q: search, limit: 200 };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.gate) params.gate = filters.gate;

      const result = await listVisitorEntries(params);
      setVisitors(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      toast.error("Failed to fetch visitor history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchVisitors();
  };

  const clearFilters = () => {
    setFilters({ from: "", to: "", gate: "" });
    setSearch("");
  };

  const formatTime = (iso) => {
    if (!iso) return "—";
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (entry, exit) => {
    if (!entry || !exit) return "—";
    const diff = new Date(exit) - new Date(entry);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6" data-tour="visitors-history-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2" data-tour="visitors-history-heading">
          <Clock className="w-8 h-8" />
          Visitor History
        </h1>
        <p className="text-gray-600 mt-1">Search and filter past visitor entries</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-4" data-tour="visitors-history-filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, phone, CNIC, vehicle..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : visitors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No visitor entries found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden" data-tour="visitors-history-results">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visitors.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{v.visitorName}</div>
                    <div className="text-xs text-gray-500">
                      {v.phone && <span className="mr-2">{v.phone}</span>}
                      {v.cnic && <span>{v.cnic}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {v.hostMemberRef?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatTime(v.entryTime)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {v.exitTime ? formatTime(v.exitTime) : <span className="text-green-600 font-medium">Inside</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {calculateDuration(v.entryTime, v.exitTime)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{v.gate}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{v.vehicleNumber || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 border-t">
            Showing {visitors.length} {visitors.length === 1 ? "entry" : "entries"}
          </div>
        </div>
      )}
    </div>
  );
}

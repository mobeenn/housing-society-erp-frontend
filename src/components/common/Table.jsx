import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

/**
 * Generic reusable server-side table component.
 * The data-fetching contract remains unchanged; this file only owns its
 * presentation, loading, sorting, and pagination UI.
 */
export default function Table({
  columns,
  fetchFn,
  fetchData: legacyFetchFn,
  filters = {},
  onRowClick,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataFetcher = fetchFn || legacyFetchFn;
      if (typeof dataFetcher !== "function") throw new Error("Table requires a fetchFn function");

      const result = await dataFetcher({
        page: pagination.page,
        limit: pagination.limit,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });
      const payload = result?.data?.data ?? result?.data ?? result;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : payload?.users || payload?.roles || [];
      const nextPagination = result?.pagination || result?.data?.pagination || payload?.pagination;
      setData(rows);
      setPagination(nextPagination || pagination);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit, search, sortBy, sortOrder, JSON.stringify(filters)]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("desc");
    }
    setPagination((previous) => ({ ...previous, page: 1 }));
  };

  const handlePageChange = (newPage) => setPagination((previous) => ({ ...previous, page: newPage }));

  if (error) {
    return (
      <div className="rounded-card border border-danger bg-danger-soft p-4 text-center">
        <p className="text-small text-danger">{error}</p>
        <button onClick={fetchData} className="mt-2 text-small font-semibold text-danger underline hover:no-underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPagination((previous) => ({ ...previous, page: 1 }));
          }}
          className="w-full rounded-control border border-border-strong bg-surface-raised py-2 pl-10 pr-4 text-body text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-surface">
        {loading && data.length === 0 ? (
          <div className="space-y-3 p-4" aria-label="Loading records" role="status">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="erp-skeleton h-10 rounded-control" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-small text-muted"><p>{emptyMessage}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-surface-muted">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={`px-6 py-3 text-left text-label font-semibold text-secondary ${column.sortable !== false ? "cursor-pointer select-none" : ""}`}
                      onClick={() => column.sortable !== false && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.label}</span>
                        {column.sortable !== false && sortBy === column.key && (
                          <span>{sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((row, index) => (
                  <tr
                    key={row._id || index}
                    className={`erp-table-row ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={`whitespace-nowrap px-6 py-4 text-body text-secondary ${column.numeric ? "text-right font-tabular" : ""}`}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-small text-secondary">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </p>
          <div className="flex gap-2">
            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1 || loading} className="rounded-control border border-border px-3 py-1 text-small text-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50">
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, index) => index + 1)
              .filter((page) => page === 1 || page === pagination.pages || Math.abs(page - pagination.page) <= 1)
              .map((page, index, array) => {
                if (index > 0 && page - array[index - 1] > 1) return <span key={`ellipsis-${page}`} className="px-3 py-1 text-muted">...</span>;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`rounded-control border px-3 py-1 text-small ${page === pagination.page ? "border-accent bg-accent text-on-accent" : "border-border text-primary hover:bg-surface-muted"} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {page}
                  </button>
                );
              })}
            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages || loading} className="rounded-control border border-border px-3 py-1 text-small text-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

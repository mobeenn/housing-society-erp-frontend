export default function Table({ columns, data, onRowClick, className = "" }) {
  return (
    <div className={`erp-table overflow-x-auto rounded-none border border-border ${className}`}>
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-label font-semibold text-secondary ${col.numeric ? "text-right font-tabular" : ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-small text-muted">
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row._id || idx}
                onClick={() => onRowClick?.(row)}
                className={`erp-table-row ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`whitespace-nowrap px-4 py-3 text-body text-secondary ${col.numeric ? "text-right font-tabular" : ""}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

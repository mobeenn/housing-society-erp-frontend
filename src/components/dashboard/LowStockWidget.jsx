import { AlertTriangle, PackageSearch } from "lucide-react";
import { Card } from "@/components/ui";

export default function LowStockWidget({ items = [] }) {
  return (
    <Card
      title="Low Stock"
      actions={
        <span data-tour="inventory-count" className={`rounded-full px-2.5 py-1 text-small font-semibold ${items.length ? "bg-warning-soft text-warning" : "bg-success-soft text-success"}`}>
          {items.length} items
        </span>
      }
    >
      {items.length === 0 ? (
        <div className="flex items-center gap-3 py-3 text-body text-success" data-tour="inventory-low-stock">
          <PackageSearch className="h-5 w-5" /> All tracked inventory items are above reorder levels.
        </div>
      ) : (
        <div className="space-y-3" data-tour="inventory-low-stock">
          {items.slice(0, 6).map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-body font-medium text-primary">{item.name}</p>
                <p className="text-small text-muted">{item.sku} · reorder at {item.reorderLevel} {item.unit}</p>
              </div>
              <div className="flex items-center gap-1.5 text-body font-semibold text-warning">
                <AlertTriangle className="h-4 w-4" /> {item.quantity} {item.unit}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

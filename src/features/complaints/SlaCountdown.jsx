import { useEffect, useState } from "react";

/** Isolated timer so SLA text updates without re-rendering the whole complaint page. */
export default function SlaCountdown({ slaDueDate, className = "" }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!slaDueDate) return undefined;
    const timer = window.setInterval(() => setTick((value) => value + 1), 30_000);
    return () => window.clearInterval(timer);
  }, [slaDueDate]);

  if (!slaDueDate) return <span className={className}>—</span>;

  const due = new Date(slaDueDate);
  const ms = due.getTime() - Date.now();
  const overdue = ms < 0;
  const abs = Math.abs(ms);
  const hours = Math.floor(abs / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const label = overdue ? `Overdue by ${hours}h ${minutes}m` : `${hours}h ${minutes}m remaining`;

  return (
    <span className={`${className} ${overdue ? "text-danger" : "text-secondary"}`}>
      {label}
    </span>
  );
}

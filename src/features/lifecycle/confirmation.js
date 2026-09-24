export const LIFECYCLE_CONFIRMATION = Object.freeze({
  PLOT_MERGE: "MERGE PLOTS IRREVERSIBLY",
  BUYBACK: "COMPLETE BUYBACK IRREVERSIBLY",
  CANCEL: "CANCEL BOOKING IRREVERSIBLY",
});

export const lifecycleStatusClass = (status) => {
  const value = String(status || "").toLowerCase();
  if (["completed", "done", "available", "active"].includes(value)) return "bg-emerald-100 text-emerald-700";
  if (["requested", "waiting", "pending", "inmeeting"].includes(value)) return "bg-amber-100 text-amber-700";
  if (["cancelled", "failed", "merged"].includes(value)) return "bg-red-100 text-red-700";
  return "bg-neutral-100 text-neutral-700";
};

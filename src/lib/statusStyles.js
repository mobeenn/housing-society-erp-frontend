const statusGroups = {
  success: [
    "active", "approved", "paid", "completed", "resolved", "verified", "passed", "present", "accepted", "constructed", "available", "done", "closed", "successful", "posted",
  ],
  warning: [
    "pending", "pendingapproval", "reserved", "partial", "partiallyreceived", "underreview", "requested", "waiting", "due", "inprogress", "onleave", "halfday", "expiring", "expired", "hold",
  ],
  danger: [
    "overdue", "unpaid", "cancelled", "rejected", "failed", "absent", "terminated", "blocked", "merged", "revoked", "returned", "notapproved",
  ],
  info: [
    "booked", "open", "new", "assigned", "transferred", "inmeeting", "convertedtopo", "received", "sent", "submitted", "processed", "invoiced", "generated", "underconstruction", "upcoming",
  ],
  gold: ["possessed", "premium", "highlight"],
  neutral: ["draft", "inactive", "resigned"],
};

const classByTone = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  gold: "bg-gold-soft text-gold",
  neutral: "bg-surface-muted text-secondary",
};

const toneByStatus = Object.entries(statusGroups).reduce((result, [tone, statuses]) => {
  statuses.forEach((status) => { result[status] = tone; });
  return result;
}, {});

export const getStatusTone = (status) => toneByStatus[String(status || "").toLowerCase().replace(/[\s_-]+/g, "")] || "neutral";

export const getStatusClass = (status, fallbackTone = "neutral") => classByTone[getStatusTone(status)] || classByTone[fallbackTone] || classByTone.neutral;

export const getStatusDotClass = (status) => {
  const tone = getStatusTone(status);
  if (tone === "gold") return "bg-gold";
  if (tone === "neutral") return "bg-muted";
  return `bg-${tone}`;
};

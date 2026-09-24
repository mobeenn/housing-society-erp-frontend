export const money = (value) => `PKR ${Number(value || 0).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const monthName = (month) => {
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return names[Number(month) - 1] || `Month ${month}`;
};

export const periodLabel = (run) => `${monthName(run?.month)} ${run?.year}`;

export const statusClass = (status) => {
  const value = String(status || "").toLowerCase();
  if (["paid", "closed", "active"].includes(value)) return "bg-emerald-100 text-emerald-700";
  if (["approved", "resolved"].includes(value)) return "bg-blue-100 text-blue-700";
  if (["draft", "pending"].includes(value)) return "bg-amber-100 text-amber-700";
  return "bg-neutral-100 text-neutral-700";
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

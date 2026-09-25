import { getStatusClass } from "@/lib/statusStyles";

export const money = (value) => `PKR ${Number(value || 0).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const monthName = (month) => {
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return names[Number(month) - 1] || `Month ${month}`;
};

export const periodLabel = (run) => `${monthName(run?.month)} ${run?.year}`;

export const statusClass = (status) => `rounded-badge ${getStatusClass(status)}`;

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

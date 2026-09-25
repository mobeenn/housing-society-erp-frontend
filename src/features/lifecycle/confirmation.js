import { getStatusClass } from "@/lib/statusStyles";

export const LIFECYCLE_CONFIRMATION = Object.freeze({
  PLOT_MERGE: "MERGE PLOTS IRREVERSIBLY",
  BUYBACK: "COMPLETE BUYBACK IRREVERSIBLY",
  CANCEL: "CANCEL BOOKING IRREVERSIBLY",
});

export const lifecycleStatusClass = (status) => `rounded-badge ${getStatusClass(status)}`;

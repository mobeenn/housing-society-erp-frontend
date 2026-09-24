const procurementTour = {
  moduleKey: "procurement",
  tourTitle: "Procurement Tour",
  moduleSummary:
    "The Procurement vendor workspace keeps supplier contact, tax, payment, address, and balance details together. The work is complete when a vendor has been saved, appears with the correct status and balance, and its profile and purchase history can be reviewed.",
  steps: [
    {
      id: "procurement-page",
      target: "[data-tour='procurement-page']",
      title: "Procurement workspace",
      purpose: "Use this page to maintain the supplier directory and review each vendor's current balance and purchase history.",
      completionCriteria: "The Procurement or vendor workspace heading and description are visible.",
      requiredPermission: { module: "procurement", action: "view" },
    },
    {
      id: "procurement-add-vendor",
      target: "[data-tour='procurement-add-vendor']",
      title: "Add a vendor",
      purpose: "Use Add Vendor when a supplier needs contact, tax, payment, address, and performance details.",
      completionCriteria: "The vendor form opens with contact, tax, and payment fields; after saving, the vendor appears in the supplier list.",
      requiredPermission: { module: "procurement", action: "create" },
    },
    {
      id: "procurement-filters",
      target: "[data-tour='procurement-filters']",
      title: "Filter the vendor list",
      purpose: "Use category and status filters to find active or under-review suppliers.",
      completionCriteria: "The vendor category and status filters are visible and can be changed.",
      requiredPermission: { module: "procurement", action: "view" },
    },
    {
      id: "procurement-vendors",
      target: "[data-tour='procurement-vendors']",
      title: "Review supplier records",
      purpose: "Read the vendor table for contact, payment terms, balance, and status information.",
      completionCriteria: "The vendor table is visible with contact and balance information.",
      requiredPermission: { module: "procurement", action: "view" },
    },
  ],
};

export default procurementTour;

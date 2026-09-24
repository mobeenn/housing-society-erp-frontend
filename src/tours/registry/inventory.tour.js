const inventoryTour = {
  moduleKey: "inventory",
  tourTitle: "Inventory Tour",
  moduleSummary:
    "Inventory information is shown in the low-stock section on the dashboard because there is no separate Inventory page in this build. The review is complete when the low-stock count is visible and every flagged item shows its current quantity and reorder level for follow-up.",
  steps: [
    {
      id: "inventory-dashboard",
      target: "[data-tour='inventory-dashboard']",
      title: "Inventory on the dashboard",
      purpose: "Use the dashboard as the current starting point for checking tracked stock without inventing another page.",
      completionCriteria: "The role dashboard heading and its live-data description are visible.",
      requiredPermission: { module: "inventory", action: "view" },
    },
    {
      id: "inventory-section",
      target: "[data-tour='inventory-count']",
      title: "Find the stock section",
      purpose: "Locate the low-stock area among the dashboard's operational widgets.",
      completionCriteria: "The dashboard section containing inventory information is visible.",
      requiredPermission: { module: "inventory", action: "view" },
    },
    {
      id: "inventory-count",
      target: "[data-tour='inventory-count']",
      title: "Check the item count",
      purpose: "Read the count badge to see how many tracked items are currently flagged as low stock.",
      completionCriteria: "The low-stock item count is visible beside the section title.",
      requiredPermission: { module: "inventory", action: "view" },
    },
    {
      id: "inventory-low-stock",
      target: "[data-tour='inventory-low-stock']",
      title: "Review reorder levels",
      purpose: "Read each flagged item's quantity and reorder level, then arrange replenishment through the real procurement workflow.",
      completionCriteria: "The low-stock message or item list is visible with quantities and reorder levels.",
      requiredPermission: { module: "inventory", action: "view" },
    },
  ],
};

export default inventoryTour;

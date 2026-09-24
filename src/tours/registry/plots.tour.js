const plotsTour = {
  moduleKey: "plots",
  tourTitle: "Plots / Units Tour",
  moduleSummary:
    "The plots page keeps the society's property inventory, allocation, and ownership status in one place. The work is complete when a plot has the right location, status, owner, and record action available for follow-up.",
  steps: [
    {
      id: "plots-page-intro",
      target: "[data-tour='plots-page-intro']",
      title: "Plots workspace",
      purpose: "Use this list to review available, booked, sold, or blocked plots and the owner currently shown for each one.",
      completionCriteria: "This step is done when the Plots / Units page is open and the inventory list or its empty-state message is visible.",
      requiredPermission: { module: "plots", action: "view" },
    },
    {
      id: "plots-add",
      target: "[data-tour='plots-add']",
      title: "Add a plot",
      purpose: "Use Add Plot when a new unit needs to be recorded. The form captures its block, street, size, price, and current owner.",
      completionCriteria: "The Add Plot form opens with block, street, size, price, and status fields; after saving, the new plot appears in the inventory.",
      requiredPermission: { module: "plots", action: "create" },
    },
    {
      id: "plots-filters",
      target: "[data-tour='plots-filters']",
      title: "Filter the inventory",
      purpose: "Enter a block, street, or category and choose a status to find the plot you need without scanning every row.",
      completionCriteria: "This step is done when the filter values are visible and the plot results refresh to the chosen block, street, category, or status.",
      requiredPermission: { module: "plots", action: "view" },
    },
    {
      id: "plots-status",
      target: "[data-tour='plots-status']",
      title: "Read the plot status",
      purpose: "Check the status badge and the recovery-blocked marker before making an allocation or ownership decision.",
      completionCriteria: "This step is done when a plot row shows a readable status and any recovery block is clear to the user.",
      requiredPermission: { module: "plots", action: "view" },
    },
    {
      id: "plots-row-actions",
      target: "[data-tour='plots-row-actions']",
      title: "Open or update a plot",
      purpose: "Use the row controls to open the plot record, edit its details, or remove a plot when your permissions allow it.",
      completionCriteria: "This step is done when the view, edit, and delete controls are visible beside the plot you are reviewing.",
      requiredPermission: { module: "plots", action: "edit" },
    },
  ],
};

export default plotsTour;

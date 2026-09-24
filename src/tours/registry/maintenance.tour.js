const maintenanceTour = {
  moduleKey: "maintenance",
  tourTitle: "Maintenance Tour",
  moduleSummary:
    "Maintenance helps staff raise a work order, connect it to an asset or complaint, record progress, and close the job with a completion note. The workflow is complete when the work order is saved, its status and history are readable, and the job is completed or cancelled.",
  steps: [
    {
      id: "maintenance-page",
      target: "[data-tour='maintenance-page']",
      title: "Maintenance workspace",
      purpose: "Use the Work Orders page to find maintenance jobs raised directly or from a complaint.",
      completionCriteria: "The Work Orders heading and description are visible.",
      requiredPermission: { module: "maintenance", action: "view" },
    },
    {
      id: "maintenance-new",
      target: "[data-tour='maintenance-new']",
      title: "Raise a work order",
      purpose: "Choose New work order when a repair needs an owner, priority, expected date, and materials.",
      completionCriteria: "The work-order form opens with asset, priority, and schedule fields; after saving, the job appears in the work-order list.",
      requiredPermission: { module: "maintenance", action: "create" },
    },
    {
      id: "maintenance-assets",
      target: "[data-tour='maintenance-assets']",
      title: "Open the asset registry",
      purpose: "Use Assets to see society equipment and its maintenance history before assigning a job.",
      completionCriteria: "The Assets page opens and the required equipment row with its maintenance history can be reviewed.",
      requiredPermission: { module: "maintenance", action: "view" },
    },
    {
      id: "maintenance-filters",
      target: "[data-tour='maintenance-filters']",
      title: "Filter maintenance work",
      purpose: "Use Status and Priority filters to focus on urgent or incomplete jobs.",
      completionCriteria: "The Status and Priority filters are visible and can be changed.",
      requiredPermission: { module: "maintenance", action: "view" },
    },
    {
      id: "maintenance-list",
      target: "[data-tour='maintenance-list']",
      title: "Find a work order",
      purpose: "Search the table and open a row to review assignment, costs, progress, and next action.",
      completionCriteria: "The work-order table is visible with priority and status information.",
      requiredPermission: { module: "maintenance", action: "view" },
    },
  ],
};

export default maintenanceTour;

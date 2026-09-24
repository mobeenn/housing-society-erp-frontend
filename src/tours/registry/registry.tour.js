const registryTour = {
  moduleKey: "registry",
  tourTitle: "Paperwork Registry Tour",
  moduleSummary:
    "The Paperwork Registry tracks physical document batches separately from property workflows. Staff can filter batches, create a batch from eligible plots, and mark a requested batch complete when the paperwork is finished.",
  steps: [
    {
      id: "registry-page",
      target: "[data-tour='registry-page']",
      title: "Paperwork Registry workspace",
      purpose: "Use this page to track physical document batches and their completion status.",
      completionCriteria: "The Paperwork Registry heading and workspace are visible.",
      requiredPermission: { module: "registry", action: "view" },
    },
    {
      id: "registry-overview",
      target: "[data-tour='registry-overview']",
      title: "Understand the batch register",
      purpose: "The overview explains that registry batches are separate from transfer, NOC, possession, and construction records.",
      completionCriteria: "The registry purpose description is readable below the workspace heading.",
      requiredPermission: { module: "registry", action: "view" },
    },
    {
      id: "registry-filters",
      target: "[data-tour='registry-filters']",
      title: "Filter the batches",
      purpose: "Use the date and status filters to narrow the batches that need attention.",
      completionCriteria: "The From, To, and Status filters are visible and can be changed.",
      requiredPermission: { module: "registry", action: "view" },
    },
    {
      id: "registry-new-batch",
      target: "[data-tour='registry-new-batch']",
      title: "Create a new batch",
      purpose: "Choose New Batch when paperwork for one or more eligible plots needs to be tracked.",
      completionCriteria: "The batch form opens with date, remarks, and eligible plots; after saving, a Requested batch appears in the table.",
      requiredPermission: { module: "registry", action: "create" },
    },
    {
      id: "registry-batches",
      target: "[data-tour='registry-batches']",
      title: "Review batch records",
      purpose: "Read the batch list to check requested plots, remarks, status, completion date, and the next action.",
      completionCriteria: "The registry batch table is visible with its status and completion information.",
      requiredPermission: { module: "registry", action: "view" },
    },
  ],
};

export default registryTour;

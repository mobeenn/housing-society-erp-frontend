const transfersTour = {
  moduleKey: "transfers",
  tourTitle: "Transfers Tour",
  moduleSummary:
    "Transfers help office staff record an ownership change, check the people and dues involved, and follow the request through approval and completion. The workflow is complete when a transfer is saved, its status is readable in the list, and the completed certificate can be opened when required.",
  steps: [
    {
      id: "transfers-page",
      target: "[data-tour='transfers-page']",
      title: "Transfers workspace",
      purpose: "Start here to review ownership transfer requests and see what still needs attention.",
      completionCriteria: "The Transfers heading and its short description are visible.",
      requiredPermission: { module: "transfers", action: "view" },
    },
    {
      id: "transfers-new",
      target: "[data-tour='transfers-new']",
      title: "Start a new transfer",
      purpose: "Use New transfer when a plot ownership change needs to be recorded.",
      completionCriteria: "The transfer form opens with member, plot, and dues details; after submission, the request appears in the transfer list.",
      requiredPermission: { module: "transfers", action: "create" },
    },
    {
      id: "transfers-summary",
      target: "[data-tour='transfers-summary']",
      title: "Understand the workflow",
      purpose: "This message explains that transfers are checked and approved before the ownership record changes.",
      completionCriteria: "The transfer workflow description is readable beside the page heading.",
      requiredPermission: { module: "transfers", action: "view" },
    },
    {
      id: "transfers-list",
      target: "[data-tour='transfers-list']",
      title: "Find a transfer",
      purpose: "Use the list to search requests and open a row for verification, approval, documents, or completion.",
      completionCriteria: "The transfer list area is visible and a request can be selected.",
      requiredPermission: { module: "transfers", action: "view" },
    },
  ],
};

export default transfersTour;

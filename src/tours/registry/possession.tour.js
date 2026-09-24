const possessionTour = {
  moduleKey: "possession",
  tourTitle: "Possession Tour",
  moduleSummary:
    "Possession helps staff check site readiness and dues, record the handover details, and issue the possession letter. The workflow is complete when an application is saved, its checks and charges are readable, and the letter is available after approval.",
  steps: [
    {
      id: "possession-page",
      target: "[data-tour='possession-page']",
      title: "Possession workspace",
      purpose: "Start here to review possession applications and see which handovers are still pending.",
      completionCriteria: "The Possession heading and description are visible.",
      requiredPermission: { module: "possession", action: "view" },
    },
    {
      id: "possession-new",
      target: "[data-tour='possession-new']",
      title: "Start a possession application",
      purpose: "Use Apply for possession when a member is ready for the site handover process.",
      completionCriteria: "The possession form opens with member, plot, and handover details; after submission, the application appears in the list.",
      requiredPermission: { module: "possession", action: "create" },
    },
    {
      id: "possession-summary",
      target: "[data-tour='possession-summary']",
      title: "See the handover purpose",
      purpose: "The description tells staff that eligibility, charges, and handover are handled in this area.",
      completionCriteria: "The possession handover description is readable below the heading.",
      requiredPermission: { module: "possession", action: "view" },
    },
    {
      id: "possession-list",
      target: "[data-tour='possession-list']",
      title: "Find an application",
      purpose: "Use the list to search by record and open an application for its checks and next action.",
      completionCriteria: "The possession list area is visible and an application can be selected.",
      requiredPermission: { module: "possession", action: "view" },
    },
  ],
};

export default possessionTour;

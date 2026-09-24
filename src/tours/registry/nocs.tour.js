const nocsTour = {
  moduleKey: "nocs",
  tourTitle: "NOCs Tour",
  moduleSummary:
    "NOCs help staff prepare no-objection applications, check the member and plot, clear dues, and issue the certificate. The workflow is complete when an application is saved, its approval stages are readable, and the issued certificate is available.",
  steps: [
    {
      id: "nocs-page",
      target: "[data-tour='nocs-page']",
      title: "NOCs workspace",
      purpose: "Use this page as the central place to find clearance applications and issued certificates.",
      completionCriteria: "The NOCs heading and description are visible.",
      requiredPermission: { module: "nocs", action: "view" },
    },
    {
      id: "nocs-new",
      target: "[data-tour='nocs-new']",
      title: "Apply for an NOC",
      purpose: "Choose Apply for NOC when a member needs a new clearance certificate.",
      completionCriteria: "The NOC form opens with member and plot details; after submission, the application appears in the list with its clearance status.",
      requiredPermission: { module: "nocs", action: "create" },
    },
    {
      id: "nocs-summary",
      target: "[data-tour='nocs-summary']",
      title: "Know what the application covers",
      purpose: "The page description explains that applications move through clearance and certificate stages.",
      completionCriteria: "The clearance and certificate description is readable below the heading.",
      requiredPermission: { module: "nocs", action: "view" },
    },
    {
      id: "nocs-list",
      target: "[data-tour='nocs-list']",
      title: "Review NOC requests",
      purpose: "Search the list and open a request to see its member, plot, status, and next action.",
      completionCriteria: "The NOC list area is visible and a request can be selected.",
      requiredPermission: { module: "nocs", action: "view" },
    },
  ],
};

export default nocsTour;

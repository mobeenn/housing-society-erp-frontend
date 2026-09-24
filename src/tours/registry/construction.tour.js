const constructionTour = {
  moduleKey: "construction",
  tourTitle: "Construction Tour",
  moduleSummary:
    "Construction helps staff submit work applications, record inspections, follow corrective actions, and approve completion. The workflow is complete when the application is saved, inspection findings are recorded, and the completion certificate is available after approval.",
  steps: [
    {
      id: "construction-page",
      target: "[data-tour='construction-page']",
      title: "Construction workspace",
      purpose: "Use this page to find construction applications and see their current review state.",
      completionCriteria: "The Construction heading and description are visible.",
      requiredPermission: { module: "construction", action: "view" },
    },
    {
      id: "construction-new",
      target: "[data-tour='construction-new']",
      title: "Start an application",
      purpose: "Choose New application when work on a plot needs to be submitted for review.",
      completionCriteria: "The construction form opens with plot, work type, and fee details; after submission, the application appears in the list.",
      requiredPermission: { module: "construction", action: "create" },
    },
    {
      id: "construction-summary",
      target: "[data-tour='construction-summary']",
      title: "Know the review path",
      purpose: "The description explains that applications move through review, inspection, and certificates.",
      completionCriteria: "The construction review and inspection description is readable.",
      requiredPermission: { module: "construction", action: "view" },
    },
    {
      id: "construction-list",
      target: "[data-tour='construction-list']",
      title: "Find a construction record",
      purpose: "Search the list and open a row to see its plot, member, status, and inspection actions.",
      completionCriteria: "The construction list area is visible and a record can be selected.",
      requiredPermission: { module: "construction", action: "view" },
    },
    {
      id: "construction-application",
      target: "[data-tour='construction-application']",
      title: "Keep the application details clear",
      purpose: "Use the application page to record the member, plot, work type, and fee before submitting.",
      completionCriteria: "The saved application shows the selected plot and work type, and a success confirmation confirms submission.",
      requiredPermission: { module: "construction", action: "create" },
    },
  ],
};

export default constructionTour;

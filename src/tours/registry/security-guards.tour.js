const securityGuardsTour = {
  moduleKey: "security-guards",
  tourTitle: "Security Guards Tour",
  moduleSummary:
    "The Guard Roster lets staff keep guard contact details, shifts, and daily attendance in one place. The workflow is complete when the guard is saved in the directory, appears in the chosen weekly roster, and the day's attendance mark is visible.",
  steps: [
    {
      id: "security-guards-page",
      target: "[data-tour='security-guards-page']",
      title: "Security guard workspace",
      purpose: "Start here to manage guard records, weekly shifts, and attendance.",
      completionCriteria: "The Security & Guard Roster heading and description are visible.",
      requiredPermission: { module: "security-guards", action: "view" },
    },
    {
      id: "security-guards-add",
      target: "[data-tour='security-guards-add']",
      title: "Add a guard",
      purpose: "Use Add Guard when a new security staff member needs a contact record and default shift.",
      completionCriteria: "The guard form opens with contact and shift fields; after saving, the guard appears in the directory and roster controls.",
      requiredPermission: { module: "security-guards", action: "create" },
    },
    {
      id: "security-guards-tabs",
      target: "[data-tour='security-guards-tabs']",
      title: "Choose roster or directory",
      purpose: "Switch between the duty roster and the guard directory to work with the view you need.",
      completionCriteria: "The Duty Roster and Guard Directory tabs are visible with the active view readable.",
      requiredPermission: { module: "security-guards", action: "view" },
    },
    {
      id: "security-guards-roster-controls",
      target: "[data-tour='security-guards-roster-controls']",
      title: "Set the week and guard",
      purpose: "Use the week buttons and guard filter to choose the roster period and person to review.",
      completionCriteria: "The current week and guard filter controls are visible and readable.",
      requiredPermission: { module: "security-guards", action: "view" },
    },
    {
      id: "security-guards-roster",
      target: "[data-tour='security-guards-roster']",
      title: "Review shifts and attendance",
      purpose: "Read each guard's shift and attendance marks, then use the quick buttons to record the day.",
      completionCriteria: "The roster grid shows the shift, and after attendance is marked the day's Present, Absent, or Leave value updates.",
      requiredPermission: { module: "security-guards", action: "view" },
    },
  ],
};

export default securityGuardsTour;

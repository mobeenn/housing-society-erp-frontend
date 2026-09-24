const hrTour = {
  moduleKey: "hr",
  tourTitle: "HR & Staff Tour",
  moduleSummary:
    "HR and staff pages keep employee records, daily attendance, and leave requests in one place. The module work is complete when the employee record is saved, the day's attendance is marked, and any submitted leave request shows a final approved or rejected status with the correct balance.",
  steps: [
    {
      id: "hr-page",
      target: "[data-tour='hr-page']",
      title: "HR and staff workspace",
      purpose: "Use the Employees page to find staff records and start the daily people operations.",
      completionCriteria: "The Employees heading and description are visible.",
      requiredPermission: { module: "hr", action: "view" },
    },
    {
      id: "hr-add-employee",
      target: "[data-tour='hr-add-employee']",
      title: "Add an employee",
      purpose: "Use Add Employee when a new staff member needs identity, job, contact, and system-access details.",
      completionCriteria: "The employee form opens with identity, job, and system-access fields; after saving, the employee appears in the list.",
      requiredPermission: { module: "hr", action: "create" },
    },
    {
      id: "hr-filters",
      target: "[data-tour='hr-filters']",
      title: "Filter staff records",
      purpose: "Use search, status, and department filters to find the employee record you need.",
      completionCriteria: "The employee search and filter controls are visible and can be changed.",
      requiredPermission: { module: "hr", action: "view" },
    },
    {
      id: "hr-list",
      target: "[data-tour='hr-list']",
      title: "Review the employee list",
      purpose: "Read employee IDs, contact details, department, designation, status, and linked login access.",
      completionCriteria: "The employee table is visible with readable status and access information.",
      requiredPermission: { module: "hr", action: "view" },
    },
    {
      id: "hr-employee-actions",
      target: "[data-tour='hr-employee-actions']",
      title: "Open an employee record",
      purpose: "Use the row actions to edit an employee or open the delete confirmation when access allows it.",
      completionCriteria: "The employee row actions are visible beside the selected record.",
      requiredPermission: { module: "hr", action: "edit" },
    },
  ],
};

export default hrTour;

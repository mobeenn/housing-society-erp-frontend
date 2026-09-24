const visitorsTour = {
  moduleKey: "visitors",
  tourTitle: "Visitors Tour",
  moduleSummary:
    "Visitors helps security staff record a gate entry, identify the host and purpose, and follow the visitor until exit. The workflow is complete when the entry is saved, the active list shows the visitor, and the exit is marked when they leave.",
  steps: [
    {
      id: "visitors-page",
      target: "[data-tour='visitors-page']",
      title: "Gate entry workspace",
      purpose: "Start at Gate Entry to register a visitor before they enter the society.",
      completionCriteria: "The Gate Entry heading and description are visible.",
      requiredPermission: { module: "visitors", action: "view" },
    },
    {
      id: "visitors-name",
      target: "[data-tour='visitors-name']",
      title: "Record the visitor",
      purpose: "Enter the visitor name first, then add phone or CNIC if the information is available.",
      completionCriteria: "The visitor identity fields are visible and ready for entry.",
      requiredPermission: { module: "visitors", action: "create" },
    },
    {
      id: "visitors-host",
      target: "[data-tour='visitors-host']",
      title: "Identify the host and purpose",
      purpose: "Choose the host member and purpose so staff can explain why the visitor is on site.",
      completionCriteria: "The host and purpose fields are visible and selected values are readable.",
      requiredPermission: { module: "visitors", action: "create" },
    },
    {
      id: "visitors-form",
      target: "[data-tour='visitors-form']",
      title: "Complete the entry details",
      purpose: "Add the gate, vehicle, pass, and remarks when they apply, then review the form before logging entry.",
      completionCriteria: "The full gate-entry form is visible with its action buttons.",
      requiredPermission: { module: "visitors", action: "create" },
    },
    {
      id: "visitors-submit",
      target: "[data-tour='visitors-submit']",
      title: "Log the entry",
      purpose: "Use Log Entry to save the visitor record, then open Active Visitors to mark exit later.",
      completionCriteria: "A visitor saved confirmation appears, the visitor is listed as active, and the exit action becomes available.",
      requiredPermission: { module: "visitors", action: "create" },
    },
  ],
};

export default visitorsTour;

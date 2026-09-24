const vehiclesTour = {
  moduleKey: "vehicles",
  tourTitle: "Vehicles Tour",
  moduleSummary:
    "The Vehicle Registry keeps resident vehicle details, access status, and sticker information together. The workflow is complete when the vehicle is saved, its owner and number are readable in the registry, and the current sticker or access status is visible.",
  steps: [
    {
      id: "vehicles-page",
      target: "[data-tour='vehicles-page']",
      title: "Vehicle Registry workspace",
      purpose: "Use this page to review resident vehicles and their current gate access status.",
      completionCriteria: "The Vehicle Registry heading and description are visible.",
      requiredPermission: { module: "security-vehicles", action: "view" },
    },
    {
      id: "vehicles-register",
      target: "[data-tour='vehicles-register']",
      title: "Register a vehicle",
      purpose: "Choose Register Vehicle when a resident or visitor vehicle needs a registry record.",
      completionCriteria: "The vehicle form opens with owner and vehicle details; after saving, the vehicle and sticker status appear in the registry.",
      requiredPermission: { module: "security-vehicles", action: "create" },
    },
    {
      id: "vehicles-filters",
      target: "[data-tour='vehicles-filters']",
      title: "Search and filter vehicles",
      purpose: "Use the search box, vehicle type, and status filters to find the record you need.",
      completionCriteria: "The vehicle search and filter controls are visible and can be changed.",
      requiredPermission: { module: "security-vehicles", action: "view" },
    },
    {
      id: "vehicles-stats",
      target: "[data-tour='vehicles-stats']",
      title: "Check the status summary",
      purpose: "Read the summary cards to see how many vehicles are active, blocked, or expired.",
      completionCriteria: "The vehicle status summary cards are visible with readable counts.",
      requiredPermission: { module: "security-vehicles", action: "view" },
    },
    {
      id: "vehicles-list",
      target: "[data-tour='vehicles-list']",
      title: "Review vehicle records",
      purpose: "Read the table for owner, number, sticker, and status, then use the row actions when a record changes.",
      completionCriteria: "The vehicle table is visible with owner, sticker, and status information.",
      requiredPermission: { module: "security-vehicles", action: "view" },
    },
  ],
};

export default vehiclesTour;

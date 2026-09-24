const appointmentsTour = {
  moduleKey: "appointments",
  tourTitle: "Appointments Tour",
  moduleSummary:
    "Appointments gives the front desk a token queue for business visitors meeting staff. The workflow is complete when a walk-in token is created, the visitor is checked in and out, the final Done status is visible, and the same token appears in the logs.",
  steps: [
    {
      id: "appointments-page",
      target: "[data-tour='appointments-page']",
      title: "Front-desk appointments",
      purpose: "Use this workspace to manage business visitor tokens separately from gate-security visitor records.",
      completionCriteria: "The Business Visitor Appointments heading and description are visible.",
      requiredPermission: { module: "appointments", action: "view" },
    },
    {
      id: "appointments-nav",
      target: "[data-tour='appointments-nav']",
      title: "Open today or logs",
      purpose: "Use the Today and Logs tabs to move between the live queue and appointment history.",
      completionCriteria: "The Today and Logs navigation tabs are visible with the active tab readable.",
      requiredPermission: { module: "appointments", action: "view" },
    },
    {
      id: "appointments-queue",
      target: "[data-tour='appointments-queue']",
      title: "Review today's queue",
      purpose: "Read each token, visitor, purpose, host, and status before checking the visitor in or out.",
      completionCriteria: "The Today's Queue area is visible with token and status information.",
      requiredPermission: { module: "appointments", action: "view" },
    },
    {
      id: "appointments-walkin",
      target: "[data-tour='appointments-walkin']",
      title: "Add a walk-in",
      purpose: "Choose Walk-in when a business visitor arrives without an appointment record.",
      completionCriteria: "The Walk-in form opens with visitor, purpose, and host fields that can be completed for the token.",
      requiredPermission: { module: "appointments", action: "create" },
    },
    {
      id: "appointments-create-form",
      target: "[data-tour='appointments-create-form']",
      title: "Create the token",
      purpose: "Enter the visitor name, meeting purpose, and host employee, then use Create token.",
      completionCriteria: "A Walk-in appointment created message appears and the new token is visible in Today's Queue.",
      requiredPermission: { module: "appointments", action: "create" },
    },
    {
      id: "appointments-transitions",
      target: "[data-tour='appointments-transitions']",
      title: "Check the visitor in or out",
      purpose: "Use Check in when the visitor arrives for the meeting and Check out when the meeting ends.",
      completionCriteria: "A success message appears and the token status changes from Waiting to InMeeting or from InMeeting to Done.",
      requiredPermission: { module: "appointments", action: "edit" },
    },
    {
      id: "appointments-log-filters",
      target: "[data-tour='appointments-log-filters']",
      title: "Open and filter the logs",
      purpose: "Open the Logs tab, then search by token, visitor, or purpose and set dates or status when needed.",
      completionCriteria: "The Appointment Logs page is visible and the filtered rows refresh for the selected values.",
      requiredPermission: { module: "appointments", action: "view" },
    },
    {
      id: "appointments-log-results",
      target: "[data-tour='appointments-log-results']",
      title: "Review appointment history",
      purpose: "Read the token, visitor, purpose, host, check-in, check-out, and final status in the results table.",
      completionCriteria: "The appointment log results are visible with a readable token and final status.",
      requiredPermission: { module: "appointments", action: "view" },
    },
  ],
};

export default appointmentsTour;

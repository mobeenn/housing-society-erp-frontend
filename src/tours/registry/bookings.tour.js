const bookingsTour = {
  moduleKey: "bookings",
  tourTitle: "Bookings Tour",
  moduleSummary:
    "Bookings connect a member to an available plot and prepare its payment schedule. The work is complete when a booking is submitted with the right member, plot, charges, and installment plan, then can be reviewed from the list.",
  steps: [
    {
      id: "bookings-page-intro",
      target: "[data-tour='bookings-page-intro']",
      title: "Bookings workspace",
      purpose: "Use this list to review reservations, their net payable amount, and their current approval or payment status.",
      completionCriteria: "This step is done when the Bookings page is open and the booking list or its empty-state message is visible.",
      requiredPermission: { module: "bookings", action: "view" },
    },
    {
      id: "bookings-new",
      target: "[data-tour='bookings-new']",
      title: "Create a booking",
      purpose: "Use New Booking to choose a member and an available plot, enter charges, and set the installment plan.",
      completionCriteria: "The booking form opens with member, available-plot, charge, and installment fields; after submission, the booking appears in the list.",
      requiredPermission: { module: "bookings", action: "create" },
    },
    {
      id: "bookings-status-filter",
      target: "[data-tour='bookings-status-filter']",
      title: "Filter bookings",
      purpose: "Choose a booking status to see only the reservations that need your attention.",
      completionCriteria: "This step is done when the selected status is readable in the filter and the list refreshes to that status.",
      requiredPermission: { module: "bookings", action: "view" },
    },
    {
      id: "bookings-row-actions",
      target: "[data-tour='bookings-row-actions']",
      title: "Open a booking",
      purpose: "Use the row control to open the booking record, where approval, rejection, cancellation, the installment plan, and documents can be reviewed.",
      completionCriteria: "The booking detail opens with the selected member, plot, amount, installment plan, and current status visible.",
      requiredPermission: { module: "bookings", action: "view" },
    },
  ],
};

export default bookingsTour;

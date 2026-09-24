const settingsTour = {
  moduleKey: "settings",
  tourTitle: "Society Settings Tour",
  moduleSummary:
    "Society settings hold the information and rules used across the office. The work is complete when the society identity, contact details, billing rules, and recovery settings have been checked and saved.",
  steps: [
    {
      id: "settings-page-intro",
      target: "[data-tour='settings-page-intro']",
      title: "Settings workspace",
      purpose: "Start here to review the settings that affect society records, communication, billing, and recovery work.",
      completionCriteria: "This step is done when the Society Profile page is open and its settings sections are visible.",
      requiredPermission: { module: "settings", action: "view" },
    },
    {
      id: "settings-general",
      target: "[data-tour='settings-general']",
      title: "General information",
      purpose: "Check the society name, currency, and logo used by the rest of the system.",
      completionCriteria: "This step is done when the society name and currency fields show the values your office uses.",
      requiredPermission: { module: "settings", action: "view" },
    },
    {
      id: "settings-address",
      target: "[data-tour='settings-address']",
      title: "Address details",
      purpose: "Keep the street, city, state, postal code, and country current so society documents use the right location.",
      completionCriteria: "This step is done when the address fields are readable and match the society's current address.",
      requiredPermission: { module: "settings", action: "view" },
    },
    {
      id: "settings-contact",
      target: "[data-tour='settings-contact']",
      title: "Contact information",
      purpose: "Review the phone, email, and website shown to members and on society communication.",
      completionCriteria: "This step is done when the contact fields show the office details staff should use.",
      requiredPermission: { module: "settings", action: "view" },
    },
    {
      id: "settings-billing",
      target: "[data-tour='settings-billing']",
      title: "Billing rules",
      purpose: "Check the fiscal-year start, late-fee percentage, grace period, and penalty rule used when dues are calculated.",
      completionCriteria: "This step is done when the fiscal-year and late-fee values are visible and ready to confirm.",
      requiredPermission: { module: "settings", action: "view" },
    },
    {
      id: "settings-recovery",
      target: "[data-tour='settings-recovery']",
      title: "Recovery automation",
      purpose: "Review the auto-block threshold and whether recovery agents may reserve plots from the free pool.",
      completionCriteria: "This step is done when the recovery threshold and self-reserve choice are visible.",
      requiredPermission: { module: "settings", action: "view" },
    },
    {
      id: "settings-save",
      target: "[data-tour='settings-save']",
      title: "Save settings",
      purpose: "Only users assigned Settings edit permission can save these values. Use Save Settings after checking the society details and rules.",
      completionCriteria: "This step is done when a success message appears after saving the settings.",
      requiredPermission: { module: "settings", action: "edit" },
    },
  ],
};

export default settingsTour;

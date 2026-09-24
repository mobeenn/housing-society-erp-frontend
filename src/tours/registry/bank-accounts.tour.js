const bankAccountsTour = {
  moduleKey: "bank-accounts",
  tourTitle: "Employee Bank Details Tour",
  moduleSummary:
    "Employee bank details are maintained from the HR employee form in this build. The work is complete when the employee's bank account or IBAN is saved with the employee record and can be opened again for verification during payroll review.",
  steps: [
    {
      id: "bank-accounts-employees",
      target: "[data-tour='hr-page']",
      title: "Open the employee record",
      purpose: "Use the Employees page to find the staff member whose bank details need to be checked or updated.",
      completionCriteria: "The required employee is visible in the employee list.",
      requiredPermission: { module: "hr", action: "view" },
    },
    {
      id: "bank-accounts-open-form",
      target: "[data-tour='hr-employee-actions']",
      title: "Open the employee form",
      purpose: "Use the employee's Edit action to open the existing form. The same form contains the bank information.",
      completionCriteria: "The employee form opens in Edit mode.",
      requiredPermission: { module: "hr", action: "edit" },
    },
    {
      id: "bank-accounts-section",
      target: "[data-tour='bank-accounts-section']",
      title: "Find Compensation & Bank Info",
      purpose: "Use this section of the employee form for salary information and the employee's bank account or IBAN.",
      completionCriteria: "The Compensation & Bank Info section is visible in the employee form.",
      requiredPermission: { module: "hr", action: "edit" },
    },
    {
      id: "bank-accounts-number",
      target: "[data-tour='bank-accounts-number']",
      title: "Enter the bank account",
      purpose: "Enter the account number or IBAN exactly as shown by the employee, then check it once before saving.",
      completionCriteria: "The Bank Account / IBAN field shows the intended value.",
      requiredPermission: { module: "hr", action: "edit" },
    },
    {
      id: "bank-accounts-save",
      target: "[data-tour='bank-accounts-save']",
      title: "Save the employee record",
      purpose: "Use the form's Save button after checking the bank value. Reopen the employee later when you need to confirm the stored detail.",
      completionCriteria: "A success message appears and the employee list refreshes with the updated record.",
      requiredPermission: { module: "hr", action: "edit" },
    },
  ],
};

export default bankAccountsTour;

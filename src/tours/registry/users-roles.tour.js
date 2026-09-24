const usersRolesTour = {
  moduleKey: "users-roles",
  tourTitle: "Users & Roles Tour",
  moduleSummary:
    "The admin pages help staff manage user accounts and decide what each role can see and do. The work is complete when a staff account has the right role, its access can be reviewed, and account changes are reflected in the user list.",
  steps: [
    {
      id: "users-roles-page-intro",
      target: "[data-tour='users-roles-page-intro']",
      title: "Users workspace",
      purpose: "Use this list to review staff accounts, their assigned role, and whether each account is active.",
      completionCriteria: "This step is done when the Users page is open and the account list or its empty-state message is readable.",
      requiredPermission: { module: "users-roles", action: "view" },
    },
    {
      id: "users-roles-add-user",
      target: "[data-tour='users-roles-add-user']",
      title: "Add a user",
      purpose: "Only users with User & Role edit permission can use Add User. Use it when a staff member needs a new login, then check the assigned role before saving.",
      completionCriteria: "The user form opens with identity, role, and password fields; after saving, a success message appears and the new user is listed.",
      requiredPermission: { module: "users-roles", action: "edit" },
    },
    {
      id: "users-roles-roles",
      target: "[data-tour='users-roles-roles']",
      title: "Open roles",
      purpose: "Only users with User & Role edit permission can open Roles and change access. Use this screen to review module visibility and actions for each role.",
      completionCriteria: "The Roles page opens with the role list, and the selected role's access choices can be reviewed.",
      requiredPermission: { module: "users-roles", action: "edit" },
    },
    {
      id: "users-roles-row-actions",
      target: "[data-tour='users-roles-row-actions']",
      title: "Manage an account",
      purpose: "Only users with User & Role edit permission can use these account actions. Edit, activate or deactivate the user, or send a password reset as needed.",
      completionCriteria: "After an account action, a success message appears and the user row shows the updated role or active status.",
      requiredPermission: { module: "users-roles", action: "edit" },
    },
  ],
};

export default usersRolesTour;

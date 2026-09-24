import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getTourPermissionModule,
  TOURS,
  TOUR_ROUTE_BY_MODULE,
} from "../src/tours/registry/index.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const sourceDir = path.join(frontendDir, "src");

const requiredModules = [
  "users-roles",
  "settings",
  "audit",
  "members",
  "plots",
  "bookings",
  "invoices",
  "documents",
  "payments",
  "expenses",
  "finance-gl",
  "bank-accounts",
  "dealers",
  "recovery",
  "transfers",
  "nocs",
  "possession",
  "construction",
  "plot-merge",
  "buyback",
  "registry",
  "complaints",
  "maintenance",
  "security-guards",
  "vehicles",
  "visitors",
  "appointments",
  "hr",
  "hr-payroll",
  "procurement",
  "inventory",
  "notices",
  "dashboards",
  "reports",
];

const jsxFiles = fs
  .readdirSync(sourceDir, { recursive: true })
  .filter((file) => String(file).endsWith(".jsx"));
const jsxSource = jsxFiles
  .map((file) => fs.readFileSync(path.join(sourceDir, file), "utf8"))
  .join("\n");

const errors = [];
const seenModules = new Set();

for (const tour of Object.values(TOURS)) {
  seenModules.add(tour.moduleKey);
  const prefix = tour.moduleKey;

  if (!tour.tourTitle || !tour.moduleSummary) {
    errors.push(`${prefix}: missing tourTitle or moduleSummary`);
  }
  if (!Array.isArray(tour.steps) || tour.steps.length < 4 || tour.steps.length > 8) {
    errors.push(`${prefix}: must contain between 4 and 8 steps`);
    continue;
  }
  if (!TOUR_ROUTE_BY_MODULE[tour.moduleKey]) {
    errors.push(`${prefix}: no launch route is registered`);
  }

  const stepIds = new Set();
  for (const step of tour.steps) {
    if (!step.id || !step.title || !step.purpose || typeof step.target !== "string") {
      errors.push(`${prefix}: a step is missing id, target, title, or purpose`);
      continue;
    }
    if (stepIds.has(step.id)) errors.push(`${prefix}: duplicate step id ${step.id}`);
    stepIds.add(step.id);

    if (step.completionCriteria !== null && !step.completionCriteria) {
      errors.push(`${prefix}/${step.id}: completionCriteria must be text or null`);
    }

    const permission = step.requiredPermission;
    if (permission !== null) {
      if (!permission?.module || !permission?.action) {
        errors.push(`${prefix}/${step.id}: invalid requiredPermission`);
      } else if (permission.module !== getTourPermissionModule(tour.moduleKey)) {
        errors.push(`${prefix}/${step.id}: permission module must use the registered RBAC module`);
      }
    }

    const dataTourMatch = step.target.match(/^\[data-tour=['"]([^'"]+)['"]\]$/);
    if (dataTourMatch) {
      if (!jsxSource.includes(`data-tour="${dataTourMatch[1]}"`)) {
        errors.push(`${prefix}/${step.id}: target is missing data-tour="${dataTourMatch[1]}"`);
      }
      continue;
    }

    const titleSelectorMatch = step.target.match(/^button\[title=['"]([^'"]+)['"]\]$/);
    if (titleSelectorMatch && !jsxSource.includes(`title="${titleSelectorMatch[1]}"`)) {
      errors.push(`${prefix}/${step.id}: button title target does not exist`);
    }
  }
}

for (const moduleKey of requiredModules) {
  if (!seenModules.has(moduleKey)) errors.push(`Missing required tour: ${moduleKey}`);
}
for (const moduleKey of seenModules) {
  if (!requiredModules.includes(moduleKey)) errors.push(`Unexpected tour module: ${moduleKey}`);
}

if (errors.length) {
  console.error(`Tour validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Tour validation passed: ${seenModules.size} modules, all tours have 4-8 valid steps and registered launch routes.`);
}

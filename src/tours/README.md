# Guided Tours

The tour layer uses `react-joyride` and keeps all staff-facing content in
`src/tours/registry/*.tour.js`.

## Add or update a tour

1. Add or edit the module's `<moduleKey>.tour.js` file.
2. Keep the module to 4–8 focused steps and include a `moduleSummary` that
   explains the end-to-end completion state.
3. Give every step a unique `id`, a real `target`, plain-language `purpose`,
   an observable `completionCriteria` (or `null` for a purely informational
   step), and a `requiredPermission` when the action is permissioned.
4. Register the tour and its primary route in `src/tours/registry/index.js`.
5. Add stable `data-tour` attributes to existing UI elements. Do not depend on
   generated CSS classes.
6. Run `npm run test:tours` and `npm run build`.

`TourRunner` filters every step through the existing `useCan` hook. The global
Topbar menu also requires both the tour module's view access and access to the
page where a contextual tour begins. Never add a parallel permission system in
a tour file.

The first automatic tour is marked per viewer in localStorage under
`hasSeenTour:<moduleKey>:<userId>`. Storage failures never block the page.

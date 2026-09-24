import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, CircleHelp, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { useCan } from "@/hooks/useCan";
import { useTour } from "./useTour";
import {
  getTourModuleForPath,
  getTourPermissionModule,
  TOURS,
  TOUR_ROUTE_BY_MODULE,
} from "./registry";

function TourMenuItem({ tour, onSelect }) {
  const routeModule = getTourModuleForPath(TOUR_ROUTE_BY_MODULE[tour.moduleKey]);
  const routeAllowed = useCan(getTourPermissionModule(routeModule || "__tour_no_route__"), "view");
  const allowed = useCan(getTourPermissionModule(tour.moduleKey), "view") && routeAllowed;
  if (!allowed) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect(tour.moduleKey)}
      className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-neutral-50"
    >
      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
      <span>
        <span className="block text-sm font-medium text-neutral-800">{tour.tourTitle}</span>
        <span className="block text-xs text-neutral-500">
          {tour.moduleSummary.split(".")[0]}.
        </span>
      </span>
    </button>
  );
}

export default function TourLauncherButton({ moduleKey, compact = false }) {
  const { startTour } = useTour();
  const moduleAllowed = useCan(
    getTourPermissionModule(moduleKey || "__tour_no_module__"),
    "view",
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const selectTour = (key) => {
    setOpen(false);
    const route = TOUR_ROUTE_BY_MODULE[key];
    if (route && location.pathname !== route) {
      navigate(route);
      window.setTimeout(() => startTour(key), 80);
    } else {
      startTour(key);
    }
  };

  if (moduleKey && !moduleAllowed) return null;
  if (moduleKey) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        data-tour={`tour-launcher-${moduleKey}`}
        onClick={() => startTour(moduleKey)}
        aria-label={`Start ${moduleKey} tour`}
        className={compact ? "px-2" : ""}
      >
        <CircleHelp className="h-4 w-4" />
        {!compact && <span>Start Tour</span>}
      </Button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        data-tour="global-tour-launcher"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open guided tours"
      >
        <CircleHelp className="h-4 w-4" />
        <span className="hidden sm:inline">Help / Tour</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <div className="absolute right-0 top-11 z-50 max-h-96 w-80 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-xl">
          <div className="flex items-center justify-between px-2 py-2">
            <p className="text-sm font-semibold text-neutral-900">Guided tours</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-100"
              aria-label="Close tour menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="px-2 pb-2 text-xs text-neutral-500">
            Choose a walkthrough for a section you can access.
          </p>
          {Object.values(TOURS).map((tour) => (
            <TourMenuItem key={tour.moduleKey} tour={tour} onSelect={selectTour} />
          ))}
        </div>
      )}
    </div>
  );
}

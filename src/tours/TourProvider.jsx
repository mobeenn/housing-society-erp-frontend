import { useCallback, useMemo, useState } from "react";
import { getTour, getTourModuleForPath, TOUR_ROUTE_BY_MODULE } from "./registry";
import { TourContext } from "./TourContext";

const storageKey = (userId, moduleKey) => `hasSeenTour:${moduleKey}:${userId || "anonymous"}`;

function readSeen(userId, moduleKey) {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(storageKey(userId, moduleKey)) === "true";
  } catch {
    return null;
  }
}

function writeSeen(userId, moduleKey) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey(userId, moduleKey), "true");
  } catch {
    // Storage is optional; a tour should never block normal page usage.
  }
}

export function TourProvider({ children, userId }) {
  const [activeModuleKey, setActiveModuleKey] = useState(null);
  const [stepIndex, setStepIndexState] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState(0);

  const startTour = useCallback((moduleKey) => {
    if (!getTour(moduleKey)) return false;
    // A manual launch also counts as seeing the tour, preventing a later
    // automatic start after the user has already interacted with it.
    writeSeen(userId, moduleKey);
    const contextualRouteModule = getTourModuleForPath(TOUR_ROUTE_BY_MODULE[moduleKey]);
    if (contextualRouteModule && contextualRouteModule !== moduleKey) {
      writeSeen(userId, contextualRouteModule);
    }
    setActiveModuleKey(moduleKey);
    setStepIndexState(0);
    setRunId((current) => current + 1);
    setIsRunning(true);
    return true;
  }, [userId]);

  const stopTour = useCallback(() => {
    setIsRunning(false);
    setActiveModuleKey(null);
    setStepIndexState(0);
  }, []);

  const setStepIndex = useCallback((index) => {
    setStepIndexState(Math.max(0, Number(index) || 0));
  }, []);

  const hasSeenTour = useCallback((moduleKey) => readSeen(userId, moduleKey), [userId]);

  const value = useMemo(() => ({
    activeModuleKey,
    activeTour: getTour(activeModuleKey),
    stepIndex,
    isRunning,
    runId,
    startTour,
    stopTour,
    setStepIndex,
    hasSeenTour,
  }), [activeModuleKey, stepIndex, isRunning, runId, startTour, stopTour, setStepIndex, hasSeenTour]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export default TourProvider;

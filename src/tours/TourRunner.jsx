import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Joyride } from "react-joyride";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCan } from "@/hooks/useCan";
import { getTour, getTourModuleForPath, getTourPermissionModule } from "./registry";
import { useTour } from "./useTour";

function getStepPlacement(target) {
  if (typeof document === "undefined" || typeof window === "undefined") return "auto";
  const element = document.querySelector(target);
  if (!element) return "auto";
  const rect = element.getBoundingClientRect();
  const coversMostPage = rect.width >= window.innerWidth * 0.75 && rect.height >= window.innerHeight * 0.5;
  return coversMostPage ? "center" : "auto";
}

function StepPermissionGate({ step, onDecision }) {
  const permission = step.requiredPermission;
  const allowedByPermission = useCan(permission?.module || "__tour_public__", permission?.action || "view");
  const allowed = !permission || allowedByPermission;

  useEffect(() => {
    onDecision(step.id, allowed);
  }, [allowed, onDecision, step.id]);

  return null;
}

export default function TourRunner() {
  const location = useLocation();
  const { activeTour, activeModuleKey, isRunning, runId, startTour, stopTour, setStepIndex, hasSeenTour } = useTour();
  const user = useAuthStore((state) => state.user);
  const accessLoaded = useAuthStore((state) => state.accessLoaded);
  const [permissionState, setPermissionState] = useState({ key: null, decisions: {} });
  const startedPathRef = useRef(null);
  const routeModule = getTourModuleForPath(location.pathname);
  const routeModuleAllowed = useCan(getTourPermissionModule(routeModule || "__tour_no_module__"), "view");
  const permissionKey = isRunning && activeModuleKey ? `${activeModuleKey}:${runId}` : null;
  const decisions = useMemo(
    () => (permissionState.key === permissionKey ? permissionState.decisions : {}),
    [permissionKey, permissionState],
  );

  useEffect(() => {
    if (!isRunning) {
      startedPathRef.current = null;
      return;
    }
    if (!startedPathRef.current) startedPathRef.current = location.pathname;
  }, [activeModuleKey, isRunning, location.pathname]);

  useEffect(() => {
    if (isRunning && startedPathRef.current && startedPathRef.current !== location.pathname) {
      startedPathRef.current = null;
      stopTour();
    }
  }, [isRunning, location.pathname, stopTour]);

  useEffect(() => {
    if (!user || !accessLoaded || !routeModule || !routeModuleAllowed || isRunning || !getTour(routeModule)) return;
    if (hasSeenTour(routeModule) !== false) return;
    const timer = window.setTimeout(() => startTour(routeModule), 250);
    return () => window.clearTimeout(timer);
  }, [accessLoaded, hasSeenTour, isRunning, routeModule, routeModuleAllowed, startTour, user]);

  const onDecision = useCallback((id, allowed) => {
    setPermissionState((current) => {
      const currentDecisions = current.key === permissionKey ? current.decisions : {};
      if (currentDecisions[id] === allowed) return current;
      return { key: permissionKey, decisions: { ...currentDecisions, [id]: allowed } };
    });
  }, [permissionKey]);

  const permissionReady = Boolean(
    activeTour?.steps.length
    && activeTour.steps.every((step) => Object.prototype.hasOwnProperty.call(decisions, step.id)),
  );

  const filteredSteps = useMemo(() => {
    if (!activeTour || !permissionReady) return [];
    return activeTour.steps.filter((step) => decisions[step.id] !== false);
  }, [activeTour, decisions, permissionReady]);

  useEffect(() => {
    if (isRunning && permissionReady && filteredSteps.length === 0) stopTour();
  }, [filteredSteps.length, isRunning, permissionReady, stopTour]);

  const joyrideSteps = useMemo(() => filteredSteps.map((step, index) => ({
    id: step.id,
    target: step.target,
    title: step.title,
    skipBeacon: true,
    placement: getStepPlacement(step.target),
    content: (
      <div className="space-y-2 text-body">
        <p>{step.purpose}</p>
        {step.completionCriteria && <p className="rounded-control bg-canvas px-2 py-1.5 text-small text-secondary"><strong>Done when:</strong> {step.completionCriteria}</p>}
        <p className="text-small font-medium text-accent">Step {index + 1} of {filteredSteps.length}</p>
      </div>
    ),
  })), [filteredSteps]);

  if (!activeTour || !isRunning) return null;

  return (
    <>
      {activeTour.steps.map((step) => <StepPermissionGate key={step.id} step={step} onDecision={onDecision} />)}
      <Joyride
        key={runId}
        run={isRunning && permissionReady}
        steps={joyrideSteps}
        initialStepIndex={0}
        continuous
        scrollToFirstStep
        options={{
          buttons: ["back", "close", "skip", "primary"],
          closeButtonAction: "skip",
          dismissKeyAction: "skip",
          overlayClickAction: "skip",
          blockTargetInteraction: false,
          disableFocusTrap: true,
          showProgress: true,
          spotlightClicks: true,
          spotlightPadding: 8,
        }}
        styles={{
          options: {
            backgroundColor: "var(--color-overlay)",
            arrowColor: "var(--color-bg-surface-raised)",
          },
          tooltip: {
            backgroundColor: "var(--color-bg-surface-raised)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-overlay)",
            fontFamily: "Inter, sans-serif",
          },
          tooltipContainer: { padding: "12px" },
          buttonNext: {
            backgroundColor: "var(--color-accent-primary)",
            color: "var(--color-text-on-accent)",
            borderRadius: "var(--radius-control)",
          },
          buttonBack: {
            color: "var(--color-text-secondary)",
            borderRadius: "var(--radius-control)",
          },
          buttonClose: { color: "var(--color-text-muted)" },
          buttonSkip: { color: "var(--color-text-muted)" },
        }}
        locale={{
          back: "Back",
          close: "Close",
          skip: "Skip tour",
          next: "Next",
          nextWithProgress: "Next ({current} of {total})",
        }}
        onEvent={(event, controls) => {
          if (event.type === "error:target_not_found") {
            controls.next();
            return;
          }
          if (event.type === "tour:end" || event.status === "finished" || event.status === "skipped") {
            stopTour();
            return;
          }
          if (event.action === "next" || event.action === "prev" || event.action === "go" || event.action === "close") {
            setStepIndex(event.index);
          }
        }}
      />
    </>
  );
}

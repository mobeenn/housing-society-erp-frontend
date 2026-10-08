import { useEffect, useState } from "react";
import { BREAKPOINTS, BREAKPOINT_QUERIES } from "@/lib/breakpoints";

function readMatches() {
  if (typeof window === "undefined") {
    return { sm: true, md: true, lg: true, xl: true, "2xl": false, width: 1280 };
  }
  return {
    sm: window.matchMedia(BREAKPOINT_QUERIES.sm).matches,
    md: window.matchMedia(BREAKPOINT_QUERIES.md).matches,
    lg: window.matchMedia(BREAKPOINT_QUERIES.lg).matches,
    xl: window.matchMedia(BREAKPOINT_QUERIES.xl).matches,
    "2xl": window.matchMedia(BREAKPOINT_QUERIES["2xl"]).matches,
    width: window.innerWidth,
  };
}

/**
 * Live viewport flags for JS layout (drawer, charts, hybrid tables).
 * Base (xs) = width < sm (480).
 */
export default function useBreakpoint() {
  const [matches, setMatches] = useState(readMatches);

  useEffect(() => {
    const media = Object.values(BREAKPOINT_QUERIES).map((query) => window.matchMedia(query));
    const update = () => setMatches(readMatches());
    media.forEach((mql) => mql.addEventListener("change", update));
    window.addEventListener("resize", update);
    update();
    return () => {
      media.forEach((mql) => mql.removeEventListener("change", update));
      window.removeEventListener("resize", update);
    };
  }, []);

  return {
    ...matches,
    isXs: !matches.sm,
    isMobile: !matches.md,
    isTablet: matches.md && !matches.lg,
    isDesktop: matches.lg,
    breakpoints: BREAKPOINTS,
  };
}

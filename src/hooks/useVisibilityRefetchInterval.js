import { useEffect, useState } from "react";

/**
 * Returns `intervalMs` while the document is visible, otherwise `false`
 * so TanStack Query pauses background polling.
 */
export default function useVisibilityRefetchInterval(intervalMs) {
  const [visible, setVisible] = useState(
    typeof document === "undefined" ? true : document.visibilityState !== "hidden",
  );

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return visible ? intervalMs : false;
}

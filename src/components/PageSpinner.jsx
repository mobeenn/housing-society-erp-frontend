import { PageSkeleton } from "@/components/ui";

/** Route Suspense fallback — skeleton only (no spinners). */
export default function PageSpinner() {
  return <PageSkeleton variant="page" label="Loading page" />;
}

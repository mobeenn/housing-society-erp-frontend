import { Link } from "react-router-dom";
import { Button } from "@/components/ui";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <h1 className="text-7xl font-extrabold text-neutral-200">404</h1>
      <p className="mt-2 text-lg font-medium text-neutral-700">Page not found</p>
      <p className="mt-1 text-sm text-neutral-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}

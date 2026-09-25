import { Link } from "react-router-dom";
import { Button } from "@/components/ui";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 text-center">
      <h1 className="text-7xl font-extrabold text-muted">404</h1>
      <p className="mt-2 text-h2 font-medium text-primary">Page not found</p>
      <p className="mt-1 text-body text-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}

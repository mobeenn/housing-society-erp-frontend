import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bell, CalendarDays, Megaphone, Plus, RefreshCw } from "lucide-react";
import { Button, Card, StatusPill } from "@/components/ui";
import { useCan } from "@/hooks/useCan";
import { noticesApi } from "./noticesApi";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-PK", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value))
    : "—";

export default function NoticeBoardPage() {
  const canCreate = useCan("notices", "create");
  const { data, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ["notices"],
    queryFn: noticesApi.list,
    refetchInterval: 30000,
  });

  const notices = data?.data || [];

  return (
    <div className="space-y-6" data-tour="notices-page">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 font-bold text-primary" data-tour="notices-heading">Notice Board</h1>
            <span className="rounded-full bg-gold-soft px-2.5 py-1 text-small font-medium text-accent">
              {notices.length} published
            </span>
          </div>
          <p className="mt-1 text-body text-secondary">Society announcements and important updates.</p>
        </div>
        <div className="flex gap-2">
          <Button data-tour="notices-refresh" variant="outline" onClick={() => refetch()} isLoading={isFetching}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          {canCreate && (
            <Link data-tour="notices-new" to="/notices/new">
              <Button><Plus className="h-4 w-4" /> New Notice</Button>
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2" data-tour="notices-list">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-card bg-surface" />)}
        </div>
      ) : isError ? (
        <Card><p className="py-8 text-center text-danger">Unable to load notices.</p></Card>
      ) : notices.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Megaphone className="mx-auto h-12 w-12 text-muted" />
            <p className="mt-3 font-medium text-primary">No published notices</p>
            <p className="mt-1 text-body text-muted">New society announcements will appear here.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2" data-tour="notices-list">
          {notices.map((notice) => (
            <Card key={notice._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="rounded-card bg-gold-soft p-2.5 text-accent"><Bell className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-primary">{notice.title}</h2>
                    <p className="mt-2 whitespace-pre-line text-body leading-6 text-secondary">{notice.body}</p>
                  </div>
                </div>
                <StatusPill status={notice.status} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-small text-muted">
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Published {formatDate(notice.publishDate)}</span>
                {notice.expiryDate && <span>Expires {formatDate(notice.expiryDate)}</span>}
                <span className="ml-auto">{notice.targetAudience}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

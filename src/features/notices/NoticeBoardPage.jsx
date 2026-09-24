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
            <h1 className="text-2xl font-bold text-neutral-900" data-tour="notices-heading">Notice Board</h1>
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
              {notices.length} published
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">Society announcements and important updates.</p>
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
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-xl bg-white" />)}
        </div>
      ) : isError ? (
        <Card><p className="py-8 text-center text-danger-600">Unable to load notices.</p></Card>
      ) : notices.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Megaphone className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-3 font-medium text-neutral-700">No published notices</p>
            <p className="mt-1 text-sm text-neutral-400">New society announcements will appear here.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2" data-tour="notices-list">
          {notices.map((notice) => (
            <Card key={notice._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="rounded-xl bg-primary-50 p-2.5 text-primary-700"><Bell className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-neutral-900">{notice.title}</h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-600">{notice.body}</p>
                  </div>
                </div>
                <StatusPill status={notice.status} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
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

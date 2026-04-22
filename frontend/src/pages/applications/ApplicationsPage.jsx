import { CheckCircle2, Filter, XCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import UserAvatar from "../../components/ui/UserAvatar";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuth } from "../../hooks/useAuth";
import {
  getApplications,
  updateApplication
} from "../../services/applicationService";
import { formatDateTime } from "../../utils/formatters";
import { isPrivilegedRole } from "../../utils/roles";

const ApplicationsPage = () => {
  const { user } = useAuth();
  const isAdmin = isPrivilegedRole(user.role);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchApplications = useCallback(
    () => getApplications(statusFilter ? { status: statusFilter } : {}),
    [statusFilter]
  );

  const {
    data: applications = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useApiQuery(fetchApplications, [statusFilter], { initialData: [] });

  const reviewMutation = useApiMutation(updateApplication, { onSuccess: refetch });
  const error = queryError || reviewMutation.error;

  const handleReview = async (applicationId, status) => {
    await reviewMutation.mutate(applicationId, { status });
  };

  const columns = useMemo(
    () => [
      { key: "volunteer", header: "Volunteer" },
      { key: "event", header: "Event" },
      { key: "status", header: "Status" },
      { key: "submitted", header: "Submitted" },
      { key: "actions", header: "Actions", className: "text-right" }
    ],
    []
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={isAdmin ? "Application review" : "Your applications"}
        description={
          isAdmin
            ? "Review incoming volunteer requests, approve the strongest matches, and keep events staffed."
            : "Track the status of every event you’ve applied for and see what has been approved."
        }
        action={
          <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-card">
            <Filter size={16} className="text-slate" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="bg-transparent text-sm font-semibold text-ink outline-none"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-[#f6c0b9] bg-[#fff3f1] px-4 py-3 text-sm text-[#b94a38]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <LoadingSpinner label="Loading applications..." />
      ) : applications.length ? (
        <div className="grid gap-5">
          {isAdmin ? (
            <DataTable
              columns={columns}
              rows={applications}
              emptyState={
                <EmptyState
                  title="No applications yet"
                  description="Volunteer requests will appear here once people start applying."
                />
              }
              renderCell={(application, key) => {
                if (key === "volunteer") {
                  return (
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={application.volunteer?.name}
                        avatarUrl={application.volunteer?.avatarUrl}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold text-ink">{application.volunteer?.name}</p>
                        <p className="text-xs text-slate">{application.volunteer?.email}</p>
                      </div>
                    </div>
                  );
                }

                if (key === "event") {
                  return (
                    <div>
                      <p className="font-semibold text-ink">{application.event.title}</p>
                      <p className="mt-1 text-xs text-slate">{application.event.location}</p>
                    </div>
                  );
                }

                if (key === "status") {
                  return <StatusBadge status={application.status} />;
                }

                if (key === "submitted") {
                  return <span className="text-slate">{formatDateTime(application.createdAt)}</span>;
                }

                if (key === "actions") {
                  return application.status === "Pending" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        className="gap-2"
                        onClick={() => handleReview(application.id, "Approved")}
                        disabled={reviewMutation.isLoading}
                      >
                        <CheckCircle2 size={16} />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        className="gap-2"
                        onClick={() => handleReview(application.id, "Rejected")}
                        disabled={reviewMutation.isLoading}
                      >
                        <XCircle size={16} />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="text-right text-sm text-slate">Reviewed</div>
                  );
                }

                return null;
              }}
            />
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <UserAvatar
                      name={application.volunteer?.name || user.name}
                      avatarUrl={application.volunteer?.avatarUrl}
                      size="md"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-ink">{application.event.title}</h2>
                        <StatusBadge status={application.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate">
                        Application submitted for {application.event.location}.
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate/70">
                        {formatDateTime(application.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-mist/70 bg-cloud/70 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate/70">Event Date</p>
                    <p className="mt-2 text-sm font-semibold text-ink">
                      {formatDateTime(application.event.date)}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-mist/70 bg-cloud/70 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate/70">Location</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{application.event.location}</p>
                  </div>
                  <div className="rounded-3xl border border-mist/70 bg-cloud/70 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate/70">Event Status</p>
                    <div className="mt-2">
                      <StatusBadge status={application.event.status} />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <EmptyState
          title="No applications yet"
          description={
            isAdmin
              ? "Volunteer requests will appear here once people start applying."
              : "Apply to an event from the Events page to start your journey."
          }
        />
      )}
    </div>
  );
};

export default ApplicationsPage;

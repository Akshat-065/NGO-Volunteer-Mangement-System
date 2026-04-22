import {
  Activity,
  CalendarDays,
  ClipboardCheck,
  Hourglass,
  TrendingUp,
  Users
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useApiQuery } from "../../hooks/useApiQuery";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import UserAvatar from "../../components/ui/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardStats } from "../../services/dashboardService";
import { formatDate, formatDateTime } from "../../utils/formatters";
import { isPrivilegedRole } from "../../utils/roles";

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: dashboard, isLoading: loading, error } = useApiQuery(getDashboardStats, []);

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  if (error) {
    return <EmptyState title="Dashboard unavailable" description={error} />;
  }

  if (!dashboard) {
    return null;
  }

  if (isPrivilegedRole(user.role)) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Operational overview"
          description="Monitor volunteer capacity, active events, and pending applications from one decision-ready dashboard."
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Volunteers"
            value={dashboard.stats.totalVolunteers}
            helper="Registered volunteers in the system"
            accentClass="bg-tide/10 text-lagoon"
          />
          <StatCard
            icon={CalendarDays}
            label="Active Events"
            value={dashboard.stats.activeEvents}
            helper="Upcoming events that still need coordination"
            accentClass="bg-sand text-coral"
          />
          <StatCard
            icon={Hourglass}
            label="Pending Requests"
            value={dashboard.stats.pendingRequests}
            helper="Applications waiting for review"
            accentClass="bg-[#fff4dd] text-[#a66b00]"
          />
          <StatCard
            icon={ClipboardCheck}
            label="Applications"
            value={dashboard.stats.totalApplications}
            helper="Total event applications submitted"
            accentClass="bg-ink/10 text-ink"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate/70">Activity Trend</p>
                <h2 className="mt-2 font-display text-3xl text-ink">Application flow</h2>
              </div>
              <div className="rounded-2xl bg-tide/10 p-3 text-lagoon">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard.chartData}>
                  <defs>
                    <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#2FA3A0" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2FA3A0" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E6EEF1" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#0D5C63"
                    strokeWidth={3}
                    fill="url(#chartFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate/70">Recent Activity</p>
                <h2 className="mt-2 font-display text-3xl text-ink">Latest requests</h2>
              </div>
              <div className="rounded-2xl bg-sand p-3 text-coral">
                <Activity size={20} />
              </div>
            </div>

            <div className="space-y-4">
              {dashboard.recentActivity.length ? (
                dashboard.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-3xl border border-mist/70 bg-cloud/70 p-4"
                  >
                    <UserAvatar name={activity.volunteerName} avatarUrl={activity.volunteerAvatar} size="sm" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink">{activity.volunteerName}</p>
                        <StatusBadge status={activity.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate">
                        Applied for <span className="font-semibold text-ink">{activity.eventTitle}</span>
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate/70">
                        {formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No recent requests"
                  description="Applications will appear here as volunteers start applying to events."
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Stay on top of upcoming events, your joined activities, and the profile details that help admins match you effectively."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Upcoming Events"
          value={dashboard.stats.upcomingEvents}
          helper="Events currently open and visible to you"
          accentClass="bg-tide/10 text-lagoon"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Joined Events"
          value={dashboard.stats.joinedEvents}
          helper="Approved or assigned opportunities"
          accentClass="bg-sand text-coral"
        />
        <StatCard
          icon={Hourglass}
          label="Pending Requests"
          value={dashboard.stats.pendingApplications}
          helper="Applications waiting for admin review"
          accentClass="bg-[#fff4dd] text-[#a66b00]"
        />
        <StatCard
          icon={TrendingUp}
          label="Profile Score"
          value={`${dashboard.stats.profileCompletion}%`}
          helper="Complete your profile to improve matching"
          accentClass="bg-ink/10 text-ink"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate/70">Discover</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Upcoming opportunities</h2>
            </div>
            <div className="rounded-2xl bg-tide/10 p-3 text-lagoon">
              <CalendarDays size={20} />
            </div>
          </div>
          <div className="space-y-4">
            {dashboard.upcomingEvents.length ? (
              dashboard.upcomingEvents.map((event) => (
                <div key={event.id} className="rounded-3xl border border-mist/70 bg-cloud/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-ink">{event.title}</h3>
                      <p className="mt-2 text-sm text-slate">{event.description}</p>
                    </div>
                    <StatusBadge status={event.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate">
                    <span>{formatDate(event.date)}</span>
                    <span>{event.location}</span>
                    <span>{event.assignedCount} volunteers assigned</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No upcoming events"
                description="Once events are published by the admin, they’ll show up here."
              />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate/70">Your Impact</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Joined events</h2>
            </div>
            <div className="rounded-2xl bg-sand p-3 text-coral">
              <ClipboardCheck size={20} />
            </div>
          </div>
          <div className="space-y-4">
            {dashboard.joinedEvents.length ? (
              dashboard.joinedEvents.map((event) => (
                <div key={event.id} className="rounded-3xl border border-mist/70 bg-cloud/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-ink">{event.title}</h3>
                    <StatusBadge status={event.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate">
                    <span>{formatDate(event.date)}</span>
                    <span>{event.location}</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No joined events yet"
                description="Approved event assignments will appear here once your applications are accepted."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

import { CalendarDays, MapPin, Plus, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";
import EventFormModal from "../../components/forms/EventFormModal";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import UserAvatar from "../../components/ui/UserAvatar";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuth } from "../../hooks/useAuth";
import {
  applyToEvent,
  getApplications
} from "../../services/applicationService";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent
} from "../../services/eventService";
import { getVolunteers } from "../../services/volunteerService";
import { formatDateTime } from "../../utils/formatters";
import { isPrivilegedRole } from "../../utils/roles";

const normalizeWords = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);

const uniqueWords = (words = []) => [...new Set(words)];

const scoreVolunteer = (event, volunteer) => {
  const eventWords = uniqueWords(
    normalizeWords(`${event.title || ""} ${event.description || ""} ${event.location || ""}`)
  );
  const skillWords = uniqueWords((volunteer.skills || []).flatMap((skill) => normalizeWords(skill)));

  if (!eventWords.length || !skillWords.length) {
    return {
      score: 0,
      matches: []
    };
  }

  const skillSet = new Set(skillWords);
  const matches = eventWords.filter((word) => skillSet.has(word));

  return {
    score: matches.length / Math.max(eventWords.length, 1),
    matches
  };
};

const EventsPage = () => {
  const { user } = useAuth();
  const isAdmin = isPrivilegedRole(user.role);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [suggestedEventId, setSuggestedEventId] = useState(null);

  const eventsQuery = useApiQuery(getEvents, [isAdmin], { initialData: [] });
  const volunteersQuery = useApiQuery(getVolunteers, [isAdmin], {
    enabled: isAdmin,
    initialData: []
  });
  const applicationsQuery = useApiQuery(getApplications, [isAdmin], {
    enabled: !isAdmin,
    initialData: []
  });

  const createMutation = useApiMutation(createEvent, { onSuccess: eventsQuery.refetch });
  const updateMutation = useApiMutation(updateEvent, { onSuccess: eventsQuery.refetch });
  const deleteMutation = useApiMutation(deleteEvent, { onSuccess: eventsQuery.refetch });
  const applyMutation = useApiMutation(applyToEvent, {
    onSuccess: async () => {
      await Promise.all([eventsQuery.refetch(), applicationsQuery.refetch()]);
    }
  });

  const events = eventsQuery.data || [];
  const volunteers = volunteersQuery.data || [];
  const applications = applicationsQuery.data || [];
  const loading = eventsQuery.isLoading || volunteersQuery.isLoading || applicationsQuery.isLoading;
  const saving = createMutation.isLoading || updateMutation.isLoading;
  const error =
    eventsQuery.error ||
    volunteersQuery.error ||
    applicationsQuery.error ||
    createMutation.error ||
    updateMutation.error ||
    deleteMutation.error ||
    applyMutation.error;

  const applicationMap = useMemo(
    () =>
      applications.reduce((accumulator, application) => {
        accumulator[application.event.id] = application;
        return accumulator;
      }, {}),
    [applications]
  );

  const volunteerSuggestions = useMemo(() => {
    if (!isAdmin || !events.length || !volunteers.length) {
      return {};
    }

    return events.reduce((accumulator, event) => {
      const assignedIds = new Set((event.assignedVolunteers || []).map((volunteer) => volunteer.id));

      const suggestions = volunteers
        .filter((volunteer) => !assignedIds.has(volunteer.id))
        .map((volunteer) => ({
          ...scoreVolunteer(event, volunteer),
          volunteer
        }))
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score)
        .slice(0, 3);

      accumulator[event.id] = suggestions;
      return accumulator;
    }, {});
  }, [events, isAdmin, volunteers]);

  const handleCreate = () => {
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleDelete = async (event) => {
    const confirmed = window.confirm(`Delete event "${event.title}"?`);
    if (!confirmed) {
      return;
    }

    await deleteMutation.mutate(event.id);
  };

  const handleSave = async (payload) => {
    if (selectedEvent) {
      await updateMutation.mutate(selectedEvent.id, payload);
    } else {
      await createMutation.mutate(payload);
    }

    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleApply = async (eventId) => {
    await applyMutation.mutate(eventId);
  };

  const handleSuggestVolunteers = (eventId) => {
    setSuggestedEventId((current) => (current === eventId ? null : eventId));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={isAdmin ? "Event operations" : "Explore events"}
        description={
          isAdmin
            ? "Create new programs, assign volunteers, and keep your event roster moving."
            : "Browse upcoming opportunities, check assignment status, and apply to events that match your availability."
        }
        action={
          isAdmin ? (
            <Button onClick={handleCreate} className="gap-2">
              <Plus size={16} />
              Create Event
            </Button>
          ) : null
        }
      />

      {error ? (
        <div className="rounded-2xl border border-[#f6c0b9] bg-[#fff3f1] px-4 py-3 text-sm text-[#b94a38]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <LoadingSpinner label="Loading events..." />
      ) : events.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {events.map((event) => {
            const application = applicationMap[event.id];
            const isApplied = Boolean(application);
            const canApply = !isAdmin && !isApplied && event.status !== "Completed";

            return (
              <Card key={event.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-ink">{event.title}</h2>
                      <StatusBadge status={event.status} />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate">{event.description}</p>
                  </div>

                  {isAdmin ? (
                    <div className="flex flex-wrap gap-3">
                      <Button variant="secondary" onClick={() => handleSuggestVolunteers(event.id)}>
                        <Sparkles size={16} />
                        Suggest Volunteers
                      </Button>
                      <Button variant="ghost" onClick={() => handleEdit(event)}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(event)}>
                        Delete
                      </Button>
                    </div>
                  ) : application ? (
                    <StatusBadge status={application.status} />
                  ) : null}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-mist/70 bg-cloud/70 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <CalendarDays size={16} />
                      {formatDateTime(event.date)}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-mist/70 bg-cloud/70 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <MapPin size={16} />
                      {event.location}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-mist/70 bg-cloud/70 p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
                    <Users size={16} />
                    Assigned volunteers ({event.assignedVolunteers.length})
                  </div>

                  {event.assignedVolunteers.length ? (
                    <div className="flex flex-wrap gap-3">
                      {event.assignedVolunteers.map((volunteer) => (
                        <div
                          key={volunteer.id}
                          className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white px-3 py-2"
                        >
                          <UserAvatar
                            name={volunteer.name}
                            avatarUrl={volunteer.avatarUrl}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-semibold text-ink">{volunteer.name}</p>
                            <p className="text-xs text-slate">{volunteer.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate">No volunteers assigned yet.</p>
                  )}
                </div>

                {isAdmin && suggestedEventId === event.id ? (
                  <div className="mt-4 rounded-3xl border border-tide/20 bg-tide/5 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                      <Sparkles size={16} />
                      Recommended volunteers
                    </div>

                    {volunteerSuggestions[event.id]?.length ? (
                      <div className="space-y-3">
                        {volunteerSuggestions[event.id].map(({ volunteer, matches, score }) => (
                          <div
                            key={volunteer.id}
                            className="flex items-start justify-between gap-4 rounded-2xl border border-white/80 bg-white px-4 py-3"
                          >
                            <div className="flex items-start gap-3">
                              <UserAvatar
                                name={volunteer.user?.name}
                                avatarUrl={volunteer.user?.avatarUrl}
                                size="sm"
                              />
                              <div>
                                <p className="font-semibold text-ink">{volunteer.user?.name}</p>
                                <p className="text-xs text-slate">{volunteer.user?.email}</p>
                                <p className="mt-2 text-sm text-slate">
                                  Skills: {volunteer.skills.join(", ") || "No skills listed"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="rounded-full bg-tide/10 px-2.5 py-1 text-xs font-semibold text-lagoon">
                                {Math.round(score * 100)}% match
                              </span>
                              {matches.length ? (
                                <p className="mt-2 text-xs text-slate">Match: {matches.join(", ")}</p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate">
                        No strong matches yet. Try adding more skill-specific volunteer profiles.
                      </p>
                    )}
                  </div>
                ) : null}

                {!isAdmin ? (
                  <div className="mt-6">
                    <Button
                      className="w-full"
                      variant={canApply ? "primary" : "secondary"}
                      onClick={() => handleApply(event.id)}
                      disabled={!canApply}
                    >
                      {application
                        ? `Application ${application.status}`
                        : event.status === "Completed"
                          ? "Event completed"
                          : "Apply for this event"}
                    </Button>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No events yet"
          description={
            isAdmin
              ? "Create your first event to start assigning volunteers and accepting applications."
              : "The admin hasn’t published any events yet. Check back soon."
          }
        />
      )}

      {isAdmin ? (
        <EventFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSave}
          initialData={selectedEvent}
          volunteers={volunteers}
          isLoading={saving}
        />
      ) : null}
    </div>
  );
};

export default EventsPage;

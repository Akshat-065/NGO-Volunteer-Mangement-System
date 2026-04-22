import { Search, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import VolunteerFormModal from "../../components/forms/VolunteerFormModal";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import UserAvatar from "../../components/ui/UserAvatar";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useApiQuery } from "../../hooks/useApiQuery";
import {
  createVolunteer,
  deleteVolunteer,
  getVolunteers,
  updateVolunteer
} from "../../services/volunteerService";

const VolunteerManagementPage = () => {
  const [filters, setFilters] = useState({ availability: "", skill: "" });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchText(searchText.trim().toLowerCase());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  const fetchVolunteers = useCallback(
    () => getVolunteers(filters),
    [filters.availability, filters.skill]
  );

  const {
    data: volunteers = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useApiQuery(fetchVolunteers, [filters.availability, filters.skill], {
    initialData: []
  });

  const createMutation = useApiMutation(createVolunteer, { onSuccess: refetch });
  const updateMutation = useApiMutation(updateVolunteer, { onSuccess: refetch });
  const deleteMutation = useApiMutation(deleteVolunteer, { onSuccess: refetch });

  const saving = createMutation.isLoading || updateMutation.isLoading;
  const error = queryError || createMutation.error || updateMutation.error || deleteMutation.error;

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleOpenCreate = () => {
    setSelectedVolunteer(null);
    setModalOpen(true);
  };

  const handleEdit = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setModalOpen(true);
  };

  const handleDelete = async (volunteer) => {
    const confirmed = window.confirm(`Delete volunteer ${volunteer.user.name}?`);
    if (!confirmed) {
      return;
    }

    await deleteMutation.mutate(volunteer.id);
  };

  const handleSubmit = async (payload) => {
    if (selectedVolunteer) {
    await updateMutation.mutate(selectedVolunteer.id, payload);
    } else {
      await createMutation.mutate(payload);
    }

    setModalOpen(false);
    setSelectedVolunteer(null);
  };

  const visibleVolunteers = volunteers.filter((volunteer) => {
    if (!debouncedSearchText) {
      return true;
    }

    const searchSpace = [
      volunteer.user?.name || "",
      ...(volunteer.skills || [])
    ]
      .join(" ")
      .toLowerCase();

    return searchSpace.includes(debouncedSearchText);
  });

  const hasSearchText = Boolean(debouncedSearchText);
  const emptyTitle = hasSearchText ? "No matching volunteers" : "No volunteers found";
  const emptyDescription = hasSearchText
    ? "Try a different name or skill, or clear the search bar to see everyone again."
    : "Adjust the filters or create a new volunteer to get started.";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Volunteer directory"
        description="Search, onboard, update, and organize volunteers so the right people reach the right events quickly."
        action={
          <Button onClick={handleOpenCreate} className="gap-2">
            <UserPlus size={16} />
            Add Volunteer
          </Button>
        }
      />

      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <label className="relative block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search by name or skills"
              className="input-shell pl-11"
            />
          </label>
          <select
            name="availability"
            value={filters.availability}
            onChange={handleFilterChange}
            className="input-shell"
          >
            <option value="">All availability</option>
            <option value="Flexible">Flexible</option>
            <option value="Weekends">Weekends</option>
            <option value="Evenings">Evenings</option>
            <option value="Weekdays">Weekdays</option>
          </select>
          <input
            type="text"
            name="skill"
            value={filters.skill}
            onChange={handleFilterChange}
            placeholder="Filter by skill"
            className="input-shell"
          />
        </div>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-[#f6c0b9] bg-[#fff3f1] px-4 py-3 text-sm text-[#b94a38]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <LoadingSpinner label="Loading volunteer directory..." />
      ) : visibleVolunteers.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {visibleVolunteers.map((volunteer) => (
            <Card key={volunteer.id} className="p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <UserAvatar
                    name={volunteer.user.name}
                    avatarUrl={volunteer.user.avatarUrl}
                    size="md"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-ink">{volunteer.user.name}</h3>
                      <StatusBadge status={volunteer.availability} />
                    </div>
                    <p className="mt-2 text-sm text-slate">{volunteer.user.email}</p>
                    <p className="mt-1 text-sm text-slate">{volunteer.user.phone || "No phone added"}</p>
                    <p className="mt-1 text-sm text-slate">{volunteer.user.location || "No location set"}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => handleEdit(volunteer)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(volunteer)}>
                    Delete
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-mist/70 bg-cloud/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate/70">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {volunteer.skills.length ? (
                      volunteer.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-tide/10 px-3 py-1 text-xs font-semibold text-lagoon"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate">No skills listed yet.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-mist/70 bg-cloud/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate/70">Interests</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {volunteer.user.interests.length ? (
                      volunteer.user.interests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-coral"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate">No interests listed yet.</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-5 rounded-3xl border border-mist/70 bg-cloud/70 p-4 text-sm leading-7 text-slate">
                {volunteer.user.bio || "No bio added yet. Open the volunteer record to update their profile details."}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      )}

      <VolunteerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedVolunteer}
        isLoading={saving}
      />
    </div>
  );
};

export default VolunteerManagementPage;

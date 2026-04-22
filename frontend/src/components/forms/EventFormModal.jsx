import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import FormField from "./FormField";
import { toDateTimeInputValue } from "../../utils/formatters";

const defaultState = {
  title: "",
  description: "",
  date: "",
  location: "",
  assignedVolunteers: []
};

const EventFormModal = ({
  open,
  onClose,
  onSubmit,
  initialData,
  volunteers,
  isLoading
}) => {
  const [form, setForm] = useState(defaultState);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        date: toDateTimeInputValue(initialData.date),
        location: initialData.location || "",
        assignedVolunteers: initialData.assignedVolunteers?.map((volunteer) => volunteer.id) || []
      });
    } else {
      setForm(defaultState);
    }
  }, [initialData, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleVolunteer = (volunteerId) => {
    setForm((current) => ({
      ...current,
      assignedVolunteers: current.assignedVolunteers.includes(volunteerId)
        ? current.assignedVolunteers.filter((item) => item !== volunteerId)
        : [...current.assignedVolunteers, volunteerId]
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      date: new Date(form.date).toISOString()
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Event" : "Create Event"}
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <FormField label="Event Title" name="title" value={form.title} onChange={handleChange} required />
        <FormField
          label="Date & Time"
          name="date"
          type="datetime-local"
          value={form.date}
          onChange={handleChange}
          required
        />
        <div className="md:col-span-2">
          <FormField
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="md:col-span-2">
          <FormField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            rows={5}
            required
          />
        </div>
        <div className="md:col-span-2">
          <span className="label-text">Assign Volunteers</span>
          <div className="grid max-h-56 gap-3 overflow-y-auto rounded-3xl border border-mist/80 bg-cloud/60 p-4 md:grid-cols-2">
            {volunteers.length ? (
              volunteers.map((volunteer) => (
                <label
                  key={volunteer.id}
                  className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white p-3"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-mist text-tide focus:ring-tide"
                    checked={form.assignedVolunteers.includes(volunteer.id)}
                    onChange={() => toggleVolunteer(volunteer.id)}
                  />
                  <div>
                    <p className="font-semibold text-ink">{volunteer.user.name}</p>
                    <p className="text-sm text-slate">{volunteer.user.email}</p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-sm text-slate">Create volunteers first to assign them here.</p>
            )}
          </div>
        </div>
        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EventFormModal;


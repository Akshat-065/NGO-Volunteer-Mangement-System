import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import FormField from "./FormField";
import { joinCsv, parseCsv } from "../../utils/formatters";

const defaultState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  location: "",
  bio: "",
  interests: "",
  skills: "",
  availability: "Flexible"
};

const VolunteerFormModal = ({ open, onClose, onSubmit, initialData, isLoading }) => {
  const [form, setForm] = useState(defaultState);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.user.name || "",
        email: initialData.user.email || "",
        password: "",
        phone: initialData.user.phone || "",
        location: initialData.user.location || "",
        bio: initialData.user.bio || "",
        interests: joinCsv(initialData.user.interests || []),
        skills: joinCsv(initialData.skills || []),
        availability: initialData.availability || "Flexible"
      });
    } else {
      setForm(defaultState);
    }
  }, [initialData, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      interests: parseCsv(form.interests),
      skills: parseCsv(form.skills)
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Volunteer" : "Add Volunteer"}
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} required />
        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <FormField
          label={initialData ? "New Password" : "Password"}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder={initialData ? "Leave blank to keep current password" : "Create a secure password"}
          required={!initialData}
        />
        <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <FormField label="Location" name="location" value={form.location} onChange={handleChange} />
        <FormField
          label="Availability"
          type="select"
          name="availability"
          value={form.availability}
          onChange={handleChange}
          options={[
            { value: "Flexible", label: "Flexible" },
            { value: "Weekends", label: "Weekends" },
            { value: "Evenings", label: "Evenings" },
            { value: "Weekdays", label: "Weekdays" }
          ]}
        />
        <div className="md:col-span-2">
          <FormField
            label="Skills"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="Event Coordination, Outreach, Fundraising"
          />
        </div>
        <div className="md:col-span-2">
          <FormField
            label="Interests"
            name="interests"
            value={form.interests}
            onChange={handleChange}
            placeholder="Education, Healthcare, Community Welfare"
          />
        </div>
        <div className="md:col-span-2">
          <FormField
            label="Bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            multiline
            rows={4}
            placeholder="Share experience, strengths, or preferred impact areas"
          />
        </div>
        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? "Save Changes" : "Create Volunteer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VolunteerFormModal;


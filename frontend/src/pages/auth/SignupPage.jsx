import { useState } from "react";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import FormField from "../../components/forms/FormField";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../hooks/useAuth";
import { parseCsv } from "../../utils/formatters";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  interests: "",
  skills: "",
  availability: "Flexible"
};

const PASSWORD_HELP_TEXT =
  "Use 8+ characters with uppercase, lowercase, a number, and a special character.";

const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const getSignupErrorMessage = (requestError) => {
  const response = requestError.response?.data;
  const validationMessages = Array.isArray(response?.details)
    ? response.details.map((detail) => detail.message).filter(Boolean)
    : [];

  if (validationMessages.length > 0) {
    return validationMessages[0];
  }

  return response?.message || requestError.message || "Unable to create your account.";
};

const SignupPage = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (!isStrongPassword(form.password)) {
      setError(PASSWORD_HELP_TEXT);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        ...form,
        interests: parseCsv(form.interests),
        skills: parseCsv(form.skills)
      });
      setSuccess(response);
      setForm(initialForm);
    } catch (requestError) {
      setError(getSignupErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate/75">Check Your Inbox</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Verify your email to finish setup.</h1>
          <p className="mt-3 subtle-text">{success.message}</p>
        </div>

        {success.preview?.link ? (
          <div className="rounded-[24px] border border-mist/80 bg-cloud/70 p-4 text-sm text-slate">
            <p className="font-semibold text-ink">Development preview link</p>
            <a
              href={success.preview.link}
              className="mt-2 block break-all font-semibold text-lagoon"
            >
              {success.preview.link}
            </a>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-lagoon"
          >
            Back to sign in
            <ArrowRight size={16} />
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-sand px-6 py-5 md:px-8">
        <p className="text-sm uppercase tracking-[0.28em] text-slate/75">Volunteer Signup</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Join the mission and start contributing.</h1>
        <p className="mt-3 max-w-lg subtle-text">
          Create your volunteer profile, showcase your skills, and start applying to community events.
        </p>
      </div>

      <div className="px-6 py-6 md:px-8 md:py-8">
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
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
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <div className="text-xs text-slate md:col-span-2">{PASSWORD_HELP_TEXT}</div>
          <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <div className="md:col-span-2">
            <FormField
              label="Interests"
              name="interests"
              value={form.interests}
              onChange={handleChange}
              placeholder="Education, Environment, Healthcare"
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              label="Skills"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Outreach, Coordination, Design, Logistics"
            />
          </div>
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

          <div className="rounded-[24px] border border-mist/80 bg-cloud/70 p-4 md:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <HeartHandshake size={16} />
              Volunteer accounts are created with the `volunteer` role by default.
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-[#f6c0b9] bg-[#fff3f1] px-4 py-3 text-sm text-[#b94a38] md:col-span-2">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 md:col-span-2">
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create Account
            </Button>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-lagoon"
            >
              Already have an account?
              <ArrowRight size={16} />
            </Link>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default SignupPage;

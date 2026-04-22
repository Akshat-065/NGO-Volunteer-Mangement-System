import { ArrowRight, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FormField from "../../components/forms/FormField";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { resetPassword } from "../../services/authService";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({ token, password: form.password });
      setSuccess(response.message);
      setForm({ password: "", confirmPassword: "" });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-slate/75">Create New Password</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Choose a fresh password.</h1>
        <p className="mt-3 subtle-text">
          Use a strong password with uppercase, lowercase, number, and symbol characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="New Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <FormField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        {error ? (
          <div className="rounded-2xl border border-[#f6c0b9] bg-[#fff3f1] px-4 py-3 text-sm text-[#b94a38]">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-[#b7ded9] bg-[#eefaf8] px-4 py-3 text-sm text-[#0d5c63]">
            {success}
          </div>
        ) : null}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          <KeyRound size={16} />
          Update Password
        </Button>
      </form>

      <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-lagoon">
        Back to sign in
        <ArrowRight size={16} />
      </Link>
    </Card>
  );
};

export default ResetPasswordPage;

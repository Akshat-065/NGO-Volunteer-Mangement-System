import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormField from "../../components/forms/FormField";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../hooks/useAuth";
import { resendVerification } from "../../services/authService";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const nextRoute = location.state?.from?.pathname || "/dashboard";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setRequiresVerification(false);
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(nextRoute, { replace: true });
    } catch (requestError) {
      if (requestError.response?.data?.details?.code === "EMAIL_NOT_VERIFIED") {
        setRequiresVerification(true);
      }

      setError(requestError.response?.data?.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setNotice("");
    setIsResendingVerification(true);

    try {
      const response = await resendVerification(form.email);
      setNotice(response.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to resend the verification email right now."
      );
    } finally {
      setIsResendingVerification(false);
    }
  };

  const fillCredentials = (email, password) => {
    setForm({ email, password });
    setError("");
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="bg-sand px-6 py-5 md:px-8">
          <p className="text-sm uppercase tracking-[0.28em] text-slate/75">Welcome Back</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Sign in to continue your impact work.</h1>
          <p className="mt-3 max-w-lg subtle-text">
            Access your dashboard, manage events, track applications, and keep volunteer coordination running smoothly.
          </p>
        </div>

        <div className="px-6 py-6 md:px-8 md:py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@ngo.org"
              required
            />
            <FormField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            {error ? (
              <div className="rounded-2xl border border-[#f6c0b9] bg-[#fff3f1] px-4 py-3 text-sm text-[#b94a38]">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="rounded-2xl border border-[#b7ded9] bg-[#eefaf8] px-4 py-3 text-sm text-[#0d5c63]">
                {notice}
              </div>
            ) : null}

            {requiresVerification ? (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                isLoading={isResendingVerification}
                onClick={handleResendVerification}
              >
                Resend verification email
              </Button>
            ) : null}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 rounded-[24px] border border-mist/80 bg-cloud/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <LockKeyhole size={16} />
              Quick demo access
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => fillCredentials("admin@ngo.org", "Admin123!")}
                className="rounded-2xl border border-white/70 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <p className="text-sm font-bold text-ink">Admin account</p>
                <p className="mt-2 text-sm text-slate">`admin@ngo.org` / `Admin123!`</p>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("rohan@ngo.org", "Volunteer123!")}
                className="rounded-2xl border border-white/70 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <p className="text-sm font-bold text-ink">Volunteer account</p>
                <p className="mt-2 text-sm text-slate">`rohan@ngo.org` / `Volunteer123!`</p>
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate">
            <div className="flex items-center gap-2">
              <Mail size={16} />
              Secure access for admins and volunteers
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/forgot-password" className="font-semibold text-coral">
                Forgot password?
              </Link>
              <Link to="/signup" className="inline-flex items-center gap-2 font-semibold text-lagoon">
                Create volunteer account
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;

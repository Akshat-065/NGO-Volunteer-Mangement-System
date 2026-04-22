import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import FormField from "../../components/forms/FormField";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { forgotPassword } from "../../services/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await forgotPassword(email);
      setSuccess(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to process your request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-slate/75">Password Recovery</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Reset your password securely.</h1>
        <p className="mt-3 subtle-text">
          Enter the email linked to your account and we’ll send a time-limited reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@ngo.org"
          required
        />

        {error ? (
          <div className="rounded-2xl border border-[#f6c0b9] bg-[#fff3f1] px-4 py-3 text-sm text-[#b94a38]">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-[#b7ded9] bg-[#eefaf8] px-4 py-3 text-sm text-[#0d5c63]">
            {success.message}
            {success.preview?.link ? (
              <a href={success.preview.link} className="mt-2 block break-all font-semibold text-lagoon">
                {success.preview.link}
              </a>
            ) : null}
          </div>
        ) : null}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          <Mail size={16} />
          Send Reset Link
        </Button>
      </form>

      <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-lagoon">
        Back to sign in
        <ArrowRight size={16} />
      </Link>
    </Card>
  );
};

export default ForgotPasswordPage;

import { ArrowRight, CheckCircle2, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { verifyEmail } from "../../services/authService";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "Verifying your email..." : "This verification link is missing its token."
  );

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isMounted = true;

    const runVerification = async () => {
      try {
        const response = await verifyEmail(token);
        if (isMounted) {
          setStatus("success");
          setMessage(response.message);
        }
      } catch (requestError) {
        if (isMounted) {
          setStatus("error");
          setMessage(
            requestError.response?.data?.message || "Unable to verify this email right now."
          );
        }
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-slate/75">Email Verification</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Secure your account access.</h1>
      </div>

      {status === "loading" ? (
        <LoadingSpinner label={message} />
      ) : (
        <div
          className={`rounded-[24px] border px-5 py-5 ${
            status === "success"
              ? "border-[#b7ded9] bg-[#eefaf8] text-[#0d5c63]"
              : "border-[#f6c0b9] bg-[#fff3f1] text-[#b94a38]"
          }`}
        >
          <div className="flex items-center gap-3">
            {status === "success" ? <CheckCircle2 size={20} /> : <MailCheck size={20} />}
            <p className="text-sm font-semibold">{message}</p>
          </div>
        </div>
      )}

      <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-lagoon">
        Continue to sign in
        <ArrowRight size={16} />
      </Link>
    </Card>
  );
};

export default VerifyEmailPage;

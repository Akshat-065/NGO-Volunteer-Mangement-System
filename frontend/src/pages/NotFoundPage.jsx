import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <Card className="max-w-xl p-8 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-slate/70">404</p>
      <h1 className="mt-4 font-display text-5xl text-ink">Page not found</h1>
      <p className="mt-4 subtle-text">
        The page you were looking for doesn’t exist or has moved to a different route.
      </p>
      <Link to="/dashboard" className="mt-6 inline-block">
        <Button>Go to Dashboard</Button>
      </Link>
    </Card>
  </div>
);

export default NotFoundPage;

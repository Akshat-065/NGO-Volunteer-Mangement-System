import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { useAuth } from "./hooks/useAuth";

const AuthLayout = lazy(() => import("./layouts/AuthLayout"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const EventsPage = lazy(() => import("./pages/events/EventsPage"));
const ApplicationsPage = lazy(() => import("./pages/applications/ApplicationsPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const VolunteerManagementPage = lazy(
  () => import("./pages/volunteers/VolunteerManagementPage")
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner label="Preparing your workspace..." />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const RouteLoader = ({ children }) => (
  <Suspense fallback={<LoadingSpinner label="Loading page..." />}>{children}</Suspense>
);

const App = () => (
  <RouteLoader>
    <Routes>
      <Route
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/volunteers" element={<VolunteerManagementPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </RouteLoader>
);

export default App;

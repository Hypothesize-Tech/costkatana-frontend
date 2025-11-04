import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while validating authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Only redirect if we're sure the user is not authenticated
  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

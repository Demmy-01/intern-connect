// ProtectedRoutes.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Generic protected route component
export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Student-only protected route
export const StudentProtectedRoute = ({ children }) => {
  const { user, userType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userType !== "student") {
    // Redirect to appropriate login page based on user type
    if (userType === "organization") {
      return <Navigate to="/dashboard-overview" replace />;
    }
    if (userType === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Organization-only protected route
export const OrganizationProtectedRoute = ({ children }) => {
  const { user, userType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to="/organization-login" state={{ from: location }} replace />
    );
  }

  if (userType !== "organization") {
    // Redirect to appropriate dashboard based on user type
    if (userType === "student") {
      return <Navigate to="/dashboard" replace />;
    }
    if (userType === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/organization-login" replace />;
  }

  return children;
};

// Admin-only protected route
export const AdminProtectedRoute = ({ children }) => {
  const { user, userType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to="/admin-login" state={{ from: location }} replace />
    );
  }

  if (userType !== "admin") {
    // Redirect to appropriate dashboard based on user type
    if (userType === "student") {
      return <Navigate to="/dashboard" replace />;
    }
    if (userType === "organization") {
      return <Navigate to="/dashboard-overview" replace />;
    }
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

// Route that redirects authenticated users away from auth pages
export const GuestOnlyRoute = ({ children }) => {
  const { user, userType, isLoading, getDashboardUrl } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (user && userType) {
    return <Navigate to={getDashboardUrl()} replace />;
  }

  return children;
};
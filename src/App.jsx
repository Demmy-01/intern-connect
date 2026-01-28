import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import {
  StudentProtectedRoute,
  OrganizationProtectedRoute,
  AdminProtectedRoute,
} from "./components/ProtectedRoute";
import { supabase } from "./lib/supabase";
import securityService from "./lib/securityService";
import Home from "./pages/home.jsx";
import { About } from "./pages/about";
import { Team } from "./pages/team";
import { InternshipOpportunities } from "./pages/internship-opportunities";
import { SeamlessApplication } from "./pages/seamless-application";
import { TailoredInternship } from "./pages/tailored-internships";
import Apply from "./pages/apply";
import Dashboard from "./pages/Dashboard.jsx";
import DashboardOverview from "./orgnization/dashboard-overview";
import Applications from "./orgnization/applications";
import PostInternship from "./orgnization/post-internship";
import Profile from "./pages/profile";
import EditProfile from "./pages/edit-profile.jsx";
import ApplicationDetails from "./orgnization/application-review.jsx";
import PostedInternship from "./orgnization/posted-internship.jsx";
import EditInternship from "./orgnization/edit-internship.jsx";
import OrgnizationProfiles from "./orgnization/organization-profile.jsx";
import SentApplicationModal from "./components/sent-application.jsx";
import InternshipSearchPage from "./pages/internships.jsx";
import Login from "./auth/login";
import SignUp from "./auth/signup";
import { Toaster } from "./components/ui/sonner";
import EmailVerification from "./auth/EmailVerification";
import ForgotPassword from "./auth/ForgotPassword";
import AuthCallback from "./pages/AuthCallback";
import CVGenerator from "./pages/cv-generator.jsx";
import OrganizationLogin from "./auth/organization-login.jsx";
import OrganizationSignup from "./auth/organization-signup.jsx";
import ResetPassword from "./auth/ResetPassword.jsx";
import OrganizationOnboarding from "./orgnization/organization-onboarding.jsx";
import OrganizationProfileEdit from "./orgnization/organization-profile-edit.jsx";
import InternshipDetails from "./pages/internship-details.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PublicOrganizationProfile from "./pages/organizations-profile.jsx";
import Terms from "./pages/terms.jsx";
import OnboardingPage from "./pages/student-onboarding.jsx";
import AdminLogin from "./auth/admin-login.jsx";
import AdminDashboard from "./admin/admin-dashboard.jsx";
import AdminRoute from "./components/AdminRoute.jsx"; // Import AdminRoute

function App() {
  // VERY AGGRESSIVE CHECK: Run before render
  // If we see specific Supabase recovery tokens in URL, force redirect immediately
  if (typeof window !== "undefined" && window.location.hash) {
    const hash = window.location.hash;
    // Check for access_token AND type=recovery (or just typical recovery patterns)
    if (
      hash.includes("type=recovery") ||
      (hash.includes("access_token") &&
        hash.includes("refresh_token") &&
        document.referrer.includes("supabase"))
    ) {
      console.log(
        "CRITICAL: Recovery hash detected in App.jsx - redirecting to /reset-password",
      );
      // Use window.location.assign to be sure
      window.location.assign("/reset-password" + hash);
      return null; // Stop rendering App to prevent router conflict
    }
  }

  useEffect(() => {
    // Listen for password recovery event
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          console.log("Password recovery event detected");
          window.location.href = "/reset-password";
        }
      },
    );

    // AGGRESSIVE CHECK: Check URL hash for recovery params immediately
    if (
      window.location.hash &&
      window.location.hash.includes("type=recovery")
    ) {
      console.log("Recovery hash detected, forcing redirect");
      window.location.href = "/reset-password";
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <div className="app-container" id="app-root">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/welcome" element={<OnboardingPage />} />
          <Route path="/student-onboarding" element={<OnboardingPage />} />
          <Route path="/cv-generator" element={<CVGenerator />} />
          <Route
            path="/internship-opportunities"
            element={<InternshipOpportunities />}
          />
          <Route
            path="/seamless-application"
            element={<SeamlessApplication />}
          />
          <Route
            path="/tailored-internships"
            element={<TailoredInternship />}
          />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Application Routes */}
          <Route
            path="/apply/:id"
            element={
              <StudentProtectedRoute>
                <Apply />
              </StudentProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <StudentProtectedRoute>
                <Dashboard />
              </StudentProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <StudentProtectedRoute>
                <Profile />
              </StudentProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <StudentProtectedRoute>
                <EditProfile />
              </StudentProtectedRoute>
            }
          />
          <Route path="/internships" element={<InternshipSearchPage />} />
          <Route
            path="/internship-details/:id"
            element={
              <StudentProtectedRoute>
                <InternshipDetails />
              </StudentProtectedRoute>
            }
          />

          {/* Organization Routes */}
          <Route
            path="/dashboard-overview"
            element={
              <OrganizationProtectedRoute>
                <DashboardOverview />
              </OrganizationProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <OrganizationProtectedRoute>
                <Applications />
              </OrganizationProtectedRoute>
            }
          />
          <Route
            path="/post-internship"
            element={
              <OrganizationProtectedRoute>
                <PostInternship />
              </OrganizationProtectedRoute>
            }
          />
          <Route
            path="/application-review/:id"
            element={
              <OrganizationProtectedRoute>
                <ApplicationDetails />
              </OrganizationProtectedRoute>
            }
          />
          <Route
            path="/posted-internship"
            element={
              <OrganizationProtectedRoute>
                <PostedInternship />
              </OrganizationProtectedRoute>
            }
          />
          <Route
            path="/edit-internship/:id"
            element={
              <OrganizationProtectedRoute>
                <EditInternship />
              </OrganizationProtectedRoute>
            }
          />
          <Route
            path="/organization-profile"
            element={
              <OrganizationProtectedRoute>
                <OrgnizationProfiles />
              </OrganizationProtectedRoute>
            }
          />
          <Route
            path="/organization-profile-edit"
            element={
              <OrganizationProtectedRoute>
                <OrganizationProfileEdit />
              </OrganizationProtectedRoute>
            }
          />
          <Route
            path="/organization-onboarding"
            element={
              <OrganizationProtectedRoute>
                <OrganizationOnboarding />
              </OrganizationProtectedRoute>
            }
          />
          <Route
            path="/organizations-profile/:id"
            element={<PublicOrganizationProfile />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Modal/Component Routes */}
          <Route path="/sent-application" element={<SentApplicationModal />} />
          <Route path="/organization-login" element={<OrganizationLogin />} />
          <Route path="/organization-signup" element={<OrganizationSignup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/icn-admin-login" element={<AdminLogin />} />

          {/* Catch-all Route */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;

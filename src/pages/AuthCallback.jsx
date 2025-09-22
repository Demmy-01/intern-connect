import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import authService from "../lib/authService";
import logo from "../assets/logo_blue.png";
import { Button } from "../components/button";
import "../style/login.css";
import cancel from "../assets/cancel.png";
import check from "../assets/checked.png";

const AuthCallback = () => {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email...");
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const type = searchParams.get("type") || "student";
        const provider = searchParams.get("provider");

        setUserType(type);

        // Handle email verification
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus("error");
          setMessage("Verification failed. Please try again.");
          return;
        }

        if (data.session) {
          // For Google OAuth, we need to create the profile if it doesn't exist
          if (provider === "google") {
            const profileData = await authService.getUserProfile();

            if (!profileData.profile) {
              // Create student profile for Google users
              const { error: profileError } = await supabase
                .from("profiles")
                .insert({
                  id: data.session.user.id,
                  user_type: "student",
                  username:
                    data.session.user.user_metadata.name ||
                    data.session.user.email.split("@")[0],
                  display_name:
                    data.session.user.user_metadata.full_name ||
                    data.session.user.user_metadata.name,
                  email: data.session.user.email,
                });

              if (!profileError) {
                await supabase.from("students").insert({
                  id: data.session.user.id,
                  profile_id: data.session.user.id,
                  username:
                    data.session.user.user_metadata.name ||
                    data.session.user.email.split("@")[0],
                  full_name:
                    data.session.user.user_metadata.full_name ||
                    data.session.user.user_metadata.name,
                });
              }
            }

            setStatus("success");
            setMessage(
              "Google sign-in successful! Redirecting to dashboard..."
            );

            setTimeout(() => {
              navigate("/dashboard");
            }, 2000);
          } else {
            // Regular email verification
            setStatus("success");
            setMessage("Email verified successfully! Redirecting to login...");

            // Sign out after verification so user needs to log in
            await supabase.auth.signOut();

            setTimeout(() => {
              if (type === "organization") {
                navigate("/organization-login", {
                  state: {
                    message:
                      "Your email has been verified! You can now log in.",
                    email: data.session.user.email,
                  },
                });
              } else {
                navigate("/login", {
                  state: {
                    message:
                      "Your email has been verified! You can now log in.",
                    email: data.session.user.email,
                  },
                });
              }
            }, 2000);
          }
        } else {
          setStatus("error");
          setMessage("Verification failed. Please try again.");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  const handleRetry = () => {
    if (userType === "organization") {
      navigate("/organization-signup");
    } else {
      navigate("/signup");
    }
  };

  return (
    <>
      <div className="login-logo-container">
        <img
          src={logo}
          alt="Logo"
          className="login-logo"
          height="30px"
          width="30px"
        />
        <p>Intern connect</p>
      </div>

      <div className="login-page">
        <div className="login-container">
          <div style={{ textAlign: "center", padding: "20px" }}>
            {status === "verifying" && (
              <>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
                <h2>Verifying Email</h2>
                <p>{message}</p>
              </>
            )}

            {status === "success" && (
              <>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                  <img
                    src={check}
                    alt="success"
                    width={"120px"}
                    height={"120px"}
                  />
                </div>
                <h2>
                  {userType === "organization"
                    ? "Organization Email Verified!"
                    : "Email Verified!"}
                </h2>
                <p>{message}</p>
              </>
            )}

            {status === "error" && (
              <>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                  <img
                    src={cancel}
                    alt="error"
                    width={"120px"}
                    height={"120px"}
                  />
                </div>
                <h2>Verification Failed</h2>
                <p>{message}</p>
                <Button
                  onClick={handleRetry}
                  className="login-button"
                  style={{ marginTop: "20px" }}
                  label={"Try again"}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <center>
        <p>© 2025 Intern Connect</p>
      </center>
    </>
  );
};

export default AuthCallback;

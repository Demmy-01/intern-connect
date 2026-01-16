import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import authService from "../lib/authService";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // refs to guard duplicate work
  const initDoneRef = useRef(false);
  const currentSessionRef = useRef(null);
  const userIdRef = useRef(null);

  const fetchUserProfile = async (sessionUser) => {
    if (sessionUser) {
      console.log("AuthContext: Fetching profile using sessionUser directly");
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, user_type, username, display_name, email")
          .eq("id", sessionUser.id)
          .single();

        if (error) {
          // Handle recursive policy error gracefully
          if (error.message && error.message.includes("infinite recursion")) {
            console.warn(
              "AuthContext: RLS policy recursion error - setting default user type"
            );
            // Set a default user type based on metadata if available
            if (sessionUser.user_metadata?.user_type) {
              setUserType(sessionUser.user_metadata.user_type);
            } else {
              setUserType("student"); // Default to student
            }
            return;
          }
          console.error("AuthContext: Error fetching profile:", error);
          setUserType(null);
          return;
        }

        // SECURITY: Session isolation - detect user type mismatch
        if (userType && userType !== profile.user_type) {
          console.warn(
            "SECURITY: Detected user type mismatch! Current:",
            userType,
            "New:",
            profile.user_type
          );
          // Log out the previous session - cannot have two different user types active
          await supabase.auth.signOut();
          alert(
            "Security: You cannot have multiple account types logged in simultaneously. Previous session has been cleared. Please log in again."
          );
          setUser(null);
          setUserType(null);
          return;
        }

        setUserType(profile.user_type);
        console.log("AuthContext: User type set to", profile.user_type);
      } catch (error) {
        console.error("AuthContext: Exception fetching profile:", error);
        setUserType(null);
      }
    } else {
      setUserType(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    console.log("AuthContext: Starting to get session...");
    // Get initial session once
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!mounted) return;
        console.log("AuthContext: Session received:", session);
        currentSessionRef.current = session;
        setUser(session?.user ?? null);

        try {
          if (session?.user?.id) {
            userIdRef.current = session.user.id;
            console.log("AuthContext: Fetching user profile...");
            await fetchUserProfile(session.user);
            console.log("AuthContext: User profile fetched.");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          if (!mounted) return;
          setIsLoading(false);
          initDoneRef.current = true; // mark initial fetch done
          console.log(
            "AuthContext: isLoading set to false after initial fetch."
          );
        }
      })
      .catch((error) => {
        console.error("Error getting session:", error);
        if (mounted) setIsLoading(false);
      });

    console.log("AuthContext: Setting up auth state change listener...");
    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("AuthContext: Auth state changed, session:", session);

        // Skip handling while initial init is still running (prevents duplicate)
        if (!initDoneRef.current) {
          console.log("AuthContext: init not done yet - skipping listener");
          return;
        }

        // If session tokens are identical, skip duplicate work
        const sameSession =
          session?.access_token &&
          currentSessionRef.current?.access_token === session?.access_token;
        if (sameSession) {
          console.log("AuthContext: same session - skipping duplicate handler");
          return;
        }

        currentSessionRef.current = session;
        setUser(session?.user ?? null);

        try {
          if (session?.user?.id && session.user.id !== userIdRef.current) {
            userIdRef.current = session.user.id;
            console.log("AuthContext: Fetching user profile on auth change...");
            await fetchUserProfile(session.user);
            console.log("AuthContext: User profile fetched on auth change.");
          } else if (!session?.user) {
            userIdRef.current = null;
            setUserType(null);
          }
        } catch (error) {
          console.error("Error fetching user profile on auth change:", error);
        } finally {
          setIsLoading(false);
          console.log("AuthContext: isLoading set to false after auth change.");
        }
      }
    );

    return () => {
      mounted = false;
      // cleanup safely
      try {
        if (subscription?.unsubscribe) subscription.unsubscribe();
      } catch (err) {
        console.warn("AuthContext: subscription cleanup error", err);
      }
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const getDashboardUrl = () => {
    if (userType === "student") {
      return "/dashboard";
    } else if (userType === "organization") {
      return "/dashboard-overview";
    }
    return "/";
  };

  const value = {
    user,
    userType,
    isLoading,
    logout,
    getDashboardUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

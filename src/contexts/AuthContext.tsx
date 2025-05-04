import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { isCORSError, supabase } from "../lib/supabase";
import { AuthState, ExtendedUser } from "../types/user";

// Use our custom AuthState type
const AuthContext = createContext<AuthState | undefined>(undefined);

// Track shown toasts to prevent duplicates
const shownToasts = new Set<string>();

// Function to show toast only if it hasn't been shown recently
const showUniqueToast = (
  message: string,
  type: "success" | "error",
  id?: string
) => {
  const toastId = id || message;
  if (!shownToasts.has(toastId)) {
    shownToasts.add(toastId);

    if (type === "success") {
      toast.success(message, { id: toastId });
    } else {
      toast.error(message, { id: toastId });
    }

    // Remove from tracking after some time to allow the message to be shown again later if needed
    setTimeout(() => {
      shownToasts.delete(toastId);
    }, 5000);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirected, setIsRedirected] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasShownVerification, setHasShownVerification] = useState(false);
  const navigate = useNavigate();

  // Test connection and auth state on mount
  useEffect(() => {
    setLoading(true);

    // Check active sessions and sets the user
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser as ExtendedUser);
        const isAdmin = currentUser?.user_metadata?.role === "admin";
        // If user is verified and just completed email confirmation, show onboarding
        console.log(
          "onboarding ",
          currentUser?.user_metadata?.onboarding_complete
        );

        // If user is verified, redirect to dashboard
        if (currentUser?.email_confirmed_at && !isRedirected) {
          setIsRedirected(true);
          navigate("/dashboard", { replace: true });
        }
        if (isAdmin) {
          setLoading(false);
          navigate("/purple");
        }
      })
      .catch((error) => {
        if (isCORSError(error)) {
          showUniqueToast(
            "CORS Error: Unable to authenticate. Please check domain settings.",
            "error",
            "cors-auth-error"
          );
        }
        setLoading(false);
      });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser as ExtendedUser);
      const isAdmin = currentUser?.user_metadata?.role === "admin";

      // If user just verified their email, show the onboarding popup
      if (
        currentUser?.email_confirmed_at &&
        !currentUser?.user_metadata?.onboarding_complete &&
        !hasShownVerification
      ) {
        //  setShowOnboarding(true);
        setHasShownVerification(true);

        if (!currentUser?.user_metadata?.email_verification_notification) {
          supabase.auth.updateUser({
            data: {
              email_verification_notification: true,
            },
          });
          showUniqueToast(
            "Email verified successfully!",
            "success",
            "email-verified"
          );
        }
        console.log(currentUser.user_metadata);
        navigate("/dashboard", { replace: true });
      }

      // Only redirect to admin panel if not already on messages page
      if (isAdmin && !location.pathname.includes("/messages")) {
        setLoading(false);
        navigate("/purple");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Use window.location.origin to get the current domain for the redirect
      const currentOrigin = window.location.origin;

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            onboarding_complete: false,
            role: "user",
          },
          emailRedirectTo: `${currentOrigin}/welcome`,
        },
      });

      if (error) {
        if (isCORSError(error)) {
          throw new Error(
            "CORS Error: Unable to create account. Please check domain settings."
          );
        }
        throw error;
      }

      if (data.user && !data.user.confirmed_at) {
        showUniqueToast(
          "Please check your email for a confirmation link to complete your registration.",
          "success",
          "signup-email-sent"
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to create account");
      }
      throw new Error("An unknown error occurred");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (isCORSError(error)) {
          throw new Error(
            "CORS Error: Unable to sign in. Please check domain settings."
          );
        }
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        throw new Error("Please verify your email before signing in.");
      }

      // If user is verified but hasn't completed onboarding, show the popup
      if (
        data.user?.email_confirmed_at &&
        !data.user?.user_metadata?.onboarding_complete
      ) {
        //    setShowOnboarding(true);
      }

      // Successfully signed in and verified
      showUniqueToast("Successfully logged in!", "success", "signin-success");
      const isAdmin = data.user?.user_metadata?.role === "admin";

      // Redirect based on user role
      if (isAdmin) {
        navigate("/purple", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Sign in error:", error.message);
        throw new Error(error.message || "Invalid credentials");
      } else {
        console.error("Sign in error:", error);
        throw new Error("An unknown error occurred");
      }
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // No active session, just navigate to login
        navigate("/login");
        return;
      }

      // Clear session and storage
      await supabase.auth.signOut();
      localStorage.clear(); // Clear all local storage
      sessionStorage.clear(); // Clear all session storage

      showUniqueToast("Signed out successfully", "success", "signout-success");
      navigate("/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Sign out error:", error.message);
      } else {
        console.error("Sign out error:", error);
      }
      // Clear storage and navigate even if there's an error
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
      showUniqueToast("Signed out with warnings", "success", "signout-warning");
    }
  };

  // New method for resending verification email with improved token generation
  const resendVerificationEmail = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!email) {
        return {
          success: false,
          message: "Email is required to resend verification",
        };
      }

      // Create unique parameters to force new token generation
      const timestamp = new Date().getTime();
      // const requestId = `${email}-${timestamp}-${Math.random()
      //   .toString(36)
      //   .substring(2, 15)}`;

      // Get current window origin
      const currentOrigin = window.location.origin;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${currentOrigin}/welcome?t=${timestamp}`,
          // data: {
          //   timestamp,
          //   requestId,
          // },
        },
      });

      if (error) {
        // Handle rate limiting errors specifically
        if (
          error.message.includes("rate") ||
          error.message.includes("too many requests")
        ) {
          return {
            success: false,
            message:
              "Please wait a moment before requesting another verification email.",
          };
        }
        throw error;
      }

      return {
        success: true,
        message: "Verification email has been resent. Please check your inbox.",
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error resending verification email:", error.message);
        return {
          success: false,
          message: error.message || "Failed to resend verification email",
        };
      }
      console.error("Error resending verification email:", error);
      return {
        success: false,
        message: "An unknown error occurred while resending verification email",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        showOnboarding,
        setShowOnboarding,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

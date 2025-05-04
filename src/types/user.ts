import { User } from "@supabase/supabase-js";

// Extending the Supabase User type with our custom metadata
export interface ExtendedUser extends User {
  user_metadata: UserMetadata;
}

// Define the structure of user_metadata
export interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
  username?: string;
  email_verification_notification?: boolean;
  onboarding_complete?: boolean;
  role?: "user" | "admin";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // For any other metadata fields that might be added
}

// Type for authentication state
export interface AuthState {
  user: ExtendedUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  resendVerificationEmail: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
}

// Common props that use the user object
export interface WithUserProps {
  user: ExtendedUser;
}

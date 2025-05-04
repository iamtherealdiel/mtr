import { SupabaseClient, User } from "@supabase/supabase-js";

export const handleSignOut = async (
  supabase: SupabaseClient,
  isRejected: boolean,
  userId: string | undefined,
  signOut: () => Promise<void>
) => {
  try {
    if (isRejected) {
      await supabase.rpc("delete_user_request", { request_id: userId });
    }
    await signOut();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const checkUserIfBanned = async (
  supabase: SupabaseClient,
  user: User | null,
  setIsBanned: (isBanned: boolean) => void
) => {
  if (!user) return;
  try {
    const { data, error } = await supabase
      .from("ban")
      .select("user_id")
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error fetching ban list:", error);
      return;
    }

    setIsBanned(data.length !== 0);
  } catch (error) {
    console.error("Error in getBanList:", error);
  }
};

export const fetchUserRequest = async (
  supabase: SupabaseClient,
  userId: string
) => {
  const { data: requestData, error: requestError } = await supabase
    .from("user_requests")
    .select("status,rejection_reason")
    .eq("user_id", userId);

  if (requestError) {
    console.error("Error fetching user requests:", requestError);
    throw requestError;
  }

  return requestData;
};

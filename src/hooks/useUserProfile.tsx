import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ExtendedUser } from "../types/user";

export interface UserProfileState {
  uploadingImage: boolean;
  profileImage: string | null;
  username: string | null;
  setUsername: (value: string) => void;
  showUsernameModal: boolean;
  setShowUsernameModal: (value: boolean) => void;
  showTutorial: boolean;
  setShowTutorial: (value: boolean) => void;
  handleImageUpload: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
}

export function useUserProfile(user: ExtendedUser | null): UserProfileState {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  );
  const [username, setUsername] = useState<string | null>(
    user?.user_metadata?.username || null
  );
  const [showUsernameModal, setShowUsernameModal] = useState(
    username === "" || username === null
  );
  const [showTutorial, setShowTutorial] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setUploadingImage(true);

      // Upload image to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `/${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setProfileImage(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  return {
    uploadingImage,
    profileImage,
    username,
    setUsername,
    showUsernameModal,
    setShowUsernameModal,
    showTutorial,
    setShowTutorial,
    handleImageUpload,
  };
}

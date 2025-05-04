import { Menu, MessageSquare, Settings } from "lucide-react";
import { SettingsDropdown } from "../../../components/SettingsDropdown";
import { supabase } from "../../../lib/supabase";
import { Notification } from "../../../types/notification";
import { ExtendedUser } from "../../../types/user";
import { handleSignOut } from "../../../utils/auth";
import { NotificationDropdown } from "./NotificationDropdown";

interface DashboardHeaderProps {
  activeSection: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (value: boolean) => void;
  showSettings: boolean;
  setShowSettings: (value: boolean) => void;
  hasUnreadMessages: boolean;
  setShowMessage: (value: boolean) => void;
  notifications: Notification[];
  notifNumber: number;
  user: ExtendedUser | null;
  signOut: () => void;
  isRejected: boolean;
  handleMarkAllAsRead: () => void;
  handleClearNotifications: () => void;
  setHasNewNotification: (value: boolean) => void;
  setNotifications: (notifications: Notification[]) => void;
  setNotifNumber: (value: number) => void;
}

export function DashboardHeader({
  activeSection,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  showNotifications,
  setShowNotifications,
  showSettings,
  setShowSettings,
  hasUnreadMessages,
  setShowMessage,
  notifications,
  notifNumber,
  user,
  signOut,
  isRejected,
  handleMarkAllAsRead,
  handleClearNotifications,
  setHasNewNotification,
  setNotifications,
  setNotifNumber,
}: DashboardHeaderProps) {
  const getSectionTitle = () => {
    switch (activeSection) {
      case "overview":
        return "Dashboard";
      case "channels":
        return "Channel Management";
      case "analytics":
        return "Analytics";
      case "rights":
        return "Digital Rights";
      case "music":
        return "Music Library";
      case "balance":
        return "Balance & Earnings";
      default:
        return "Global Distribution";
    }
  };

  console.log(
    "[DashboardHeader] activeSection: ",
    activeSection,
    showNotifications,
    showSettings
  );

  return (
    <div className="flex items-center justify-between w-full p-4 mb-6 rounded-lg">
      <h1
        onMouseEnter={() => {
          setShowNotifications(false);
          setShowSettings(false);
        }}
        className="text-2xl font-semibold text-white"
      >
        {getSectionTitle()}
      </h1>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Top Right Icons */}
      <div className="flex items-center relative z-50">
        <NotificationDropdown
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notifications={notifications}
          notifNumber={notifNumber}
          supabase={supabase}
          userId={user?.id}
          setShowSettings={setShowSettings}
          setHasNewNotification={setHasNewNotification}
          setNotifications={setNotifications}
          setNotifNumber={setNotifNumber}
          markAllAsRead={(supabase, userId, handlers) => {
            handleMarkAllAsRead();
          }}
          clearNotifications={(supabase, userId, handlers) => {
            handleClearNotifications();
          }}
        />
        <div
          className="settings-button p-2 mr-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 hover:scale-110 relative cursor-pointer"
          onMouseEnter={() => {
            setShowNotifications(false);
          }}
          onClick={() => {
            setShowSettings(!showSettings);
            setShowNotifications(false);
          }}
        >
          <Settings className="h-6 w-6" />

          {/* Settings Dropdown */}
          {showSettings && (
            <SettingsDropdown
              user={user}
              handleSignOut={() =>
                handleSignOut(supabase, isRejected, user?.id, signOut)
              }
              supabase={supabase}
              isRejected={isRejected}
              signOut={signOut}
            />
          )}
        </div>
        <button
          onMouseEnter={() => {
            setShowNotifications(false);
            setShowSettings(false);
          }}
          onClick={() => {
            setShowMessage((prev) => !prev);
          }}
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 hover:scale-110"
        >
          <MessageSquare
            className={`h-6 w-6 transition-all duration-300 ${
              hasUnreadMessages
                ? "text-white animate-pulse filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                : "text-slate-400"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

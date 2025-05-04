import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Notification } from "../types/notification";
import { formatRelativeTime } from "../utils/dateUtils";
import { clearNotifications, markAllAsRead } from "../utils/notificationUtils";

export function useNotifications(user) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifNumber, setNotifNumber] = useState<number>(0);
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [notificationType, setNotificationType] = useState("info");

  const getNotifNumber = async () => {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("read", false)
        .eq("user_id", user?.id);

      if (error) throw error;

      console.log("Unread notifications:", count);
      return count;
    } catch (error) {
      console.error("Error fetching notification count:", error);
      return 0;
    }
  };

  const handleNotifications = (payload) => {
    const notif = payload.new;
    if (notif?.user_id === user?.id) {
      const { content, title, type } = notif;
      console.log({ content, title, type });
      setNotification({ content, title, type });
      setNotificationType(type);
      setIsVisible(true);
    }
  };

  useEffect(() => {
    let timer;
    if (isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      setNotifications(
        data.map((notification) => ({
          id: notification.id,
          title: notification.title,
          content: notification.content,
          time: formatRelativeTime(notification.created_at),
          read: notification.read,
        }))
      );
    };

    fetchNotifications();
    getNotifNumber().then((res) => {
      setNotifNumber(res);
    });

    // Subscribe to notifications
    const notificationSubscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        handleNotifications
      )
      .subscribe();

    return () => {
      notificationSubscription.unsubscribe();
    };
  }, [user]);

  // Effect to handle notification animation
  useEffect(() => {
    if (notifications.some((n) => !n.read)) {
      setHasNewNotification(true);
      // Reset the animation after it plays
      const timer = setTimeout(() => {
        setHasNewNotification(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    if (!user?.id) return;
    markAllAsRead(supabase, user.id, {
      setHasNewNotification,
      setNotifications,
      setNotifNumber,
    });
  };

  const handleClearNotifications = () => {
    if (!user?.id) return;
    clearNotifications(supabase, user.id, {
      setHasNewNotification,
      setNotifications,
      setNotifNumber,
    });
  };

  return {
    showNotifications,
    setShowNotifications,
    hasNewNotification,
    setHasNewNotification,
    notifications,
    setNotifications,
    notifNumber,
    setNotifNumber,
    notification,
    isVisible,
    notificationType,
    handleMarkAllAsRead,
    handleClearNotifications,
  };
}

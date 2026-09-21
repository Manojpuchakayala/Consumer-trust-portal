/**
 * Notification Service for Consumer Trust Portal
 * Manages user login notifications, session alerts, and docket status updates.
 */

const NOTIFICATION_STORAGE_KEY = "consumerTrustNotifications";
const MAX_NOTIFICATIONS = 20;

export const getNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveNotifications = (notifications) => {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
    window.dispatchEvent(new Event("notificationChange"));
  } catch (err) {
    console.error("Failed to save notifications:", err);
  }
};

export const addNotification = ({
  type = "info", // "login", "success", "security", "info", "warning"
  title,
  message,
  link = null,
  meta = null,
}) => {
  const current = getNotifications();
  const newNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type,
    title,
    message,
    link,
    meta,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const updated = [newNotification, ...current];
  saveNotifications(updated);

  // Dispatch toast alert event
  window.dispatchEvent(
    new CustomEvent("toastAlert", {
      detail: newNotification,
    })
  );

  return newNotification;
};

export const markAllAsRead = () => {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
};

export const markAsRead = (id) => {
  const current = getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
};

export const clearAllNotifications = () => {
  saveNotifications([]);
};

export const getUnreadCount = () => {
  const list = getNotifications();
  return list.filter((n) => !n.read).length;
};

/**
 * Automatically triggers an instant login notification when authentication occurs.
 */
export const triggerLoginNotification = (user, authMethod = "Password") => {
  if (!user) return null;

  const roleLabel = user.role === "admin" ? "Officer / Administrator" : "Citizen";
  const userName = user.name || (user.email ? user.email.split("@")[0] : "Citizen");
  const timeStr = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const notif = addNotification({
    type: "login",
    title: `Signed In: ${userName}`,
    message: `Secure session established as ${roleLabel} at ${timeStr} via ${authMethod}.`,
    link: user.role === "admin" ? "/admin" : "/my-complaints",
    meta: {
      userEmail: user.email,
      role: user.role,
      authMethod,
      timestamp: Date.now(),
    },
  });

  // Also fire a dedicated loginAlert event for immediate high-visibility toast banner
  window.dispatchEvent(
    new CustomEvent("loginAlert", {
      detail: {
        user,
        roleLabel,
        authMethod,
        timeStr,
      },
    })
  );

  return notif;
};

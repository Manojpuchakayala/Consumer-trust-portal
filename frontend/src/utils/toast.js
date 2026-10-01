// Event-driven global toast emitter
const listeners = new Set();

export const toast = {
  show: (message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const toastItem = { id, message, type, duration };
    listeners.forEach((listener) => listener(toastItem));
    return id;
  },
  success: (message, duration = 4000) => toast.show(message, "success", duration),
  error: (message, duration = 4500) => toast.show(message, "error", duration),
  info: (message, duration = 4000) => toast.show(message, "info", duration),
  warning: (message, duration = 4500) => toast.show(message, "warning", duration),
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

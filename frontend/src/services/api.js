import axios from "axios";

// Smart API endpoint discovery:
// 1. Explicit VITE_API_URL if configured
// 2. Localhost:5000 if running on local development server
// 3. Render cloud API as reliable production endpoint
const getBaseUrl = () => {
  // If running locally in development:
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5000/api";
  }
  // If explicit production API URL is set and not localhost:
  if (
    import.meta.env.VITE_API_URL &&
    !import.meta.env.VITE_API_URL.includes("localhost") &&
    !import.meta.env.VITE_API_URL.includes("127.0.0.1")
  ) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }
  // When running on Vercel or any live web host, use relative /api
  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/api`;
  }
  return "/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("consumerTrustToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Warmup ping to ensure backend is active immediately
if (typeof window !== "undefined") {
  setTimeout(() => {
    api.get("/health").catch(() => {});
  }, 500);
}

export default api;

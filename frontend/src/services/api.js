import axios from "axios";

// Smart API endpoint discovery:
// 1. Explicit VITE_API_URL if configured
// 2. Localhost:5000 if running on local development server
// 3. Render cloud API as reliable production endpoint
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5000/api";
  }
  return "https://consumer-trust-api.onrender.com/api";
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

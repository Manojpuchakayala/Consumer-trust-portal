import axios from "axios";

// Dynamic API endpoint discovery:
// 1. Localhost development server
// 2. Explicit VITE_API_URL if configured
// 3. Render Cloud Backend API for production Vercel deployment
const getBaseUrl = () => {
  // If running locally in development:
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5000/api";
  }

  // If explicit production API URL is set:
  if (
    import.meta.env.VITE_API_URL &&
    !import.meta.env.VITE_API_URL.includes("localhost") &&
    !import.meta.env.VITE_API_URL.includes("127.0.0.1")
  ) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }

  // Production Render Cloud Backend
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

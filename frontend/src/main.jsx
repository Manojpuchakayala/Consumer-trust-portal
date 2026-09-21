import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";

const rawGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_ID =
  rawGoogleClientId && !rawGoogleClientId.includes("example.apps.googleusercontent.com")
    ? rawGoogleClientId.trim()
    : "1089201948291-unconfigured.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);

import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotificationToast from "./components/NotificationToast";
import ToastManager from "./components/ToastManager";
import MobileBottomNav from "./components/MobileBottomNav";
import CommandPalette from "./components/CommandPalette";
import InstallAppBanner from "./components/InstallAppBanner";
import AiLegalAssistant from "./components/AiLegalAssistant";

// Route-Level Code Splitting (Lazy-Loaded Chunks for sub-second performance)
const Home = lazy(() => import("./pages/Home"));
const RegisterComplaint = lazy(() => import("./pages/RegisterComplaint"));
const TrackComplaint = lazy(() => import("./pages/TrackComplaint"));
const MyComplaints = lazy(() => import("./pages/MyComplaints"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CompanyResolution = lazy(() => import("./pages/CompanyResolution"));
const BrandLeaderboard = lazy(() => import("./pages/BrandLeaderboard"));
const ClassActionHub = lazy(() => import("./pages/ClassActionHub"));

// Legal & Governance Pages (Lazy Loaded)
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CitizenCharter = lazy(() => import("./pages/CitizenCharter"));
const AccessibilityStatement = lazy(() => import("./pages/AccessibilityStatement"));
const BrandMethodology = lazy(() => import("./pages/BrandMethodology"));
const ContactSupport = lazy(() => import("./pages/ContactSupport"));

// Page Loading Spinner Fallback
const PageLoadingFallback = () => (
  <div style={{
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    color: "#2563eb"
  }}>
    <div style={{
      width: "36px",
      height: "36px",
      border: "3px solid #e2e8f0",
      borderTopColor: "#2563eb",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite"
    }} />
    <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
      Loading Portal View...
    </span>
  </div>
);

// Route guard for authenticated users (Consumers)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("consumerTrustToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Route guard for Authorized Administrator
function AdminRoute({ children }) {
  const token = localStorage.getItem("consumerTrustToken");
  const user = JSON.parse(localStorage.getItem("consumerTrustUser") || "null");

  if (!token || !user) {
    return <Navigate to="/login?portal=admin" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/my-complaints" replace />;
  }

  return children;
}

function App() {
  useEffect(() => {
    // Proactive background keepalive ping to eliminate Render backend cold starts
    const pingBackend = () => {
      fetch("https://consumer-trust-api.onrender.com/api/health", { method: "GET", mode: "cors" }).catch(() => {});
    };
    pingBackend();
    const interval = setInterval(pingBackend, 9 * 60 * 1000); // 9 minutes interval
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <NotificationToast />
        <ToastManager />
        <CommandPalette />
        <main className="app-main">
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<RegisterComplaint />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/brands" element={<BrandLeaderboard />} />
              <Route path="/leaderboard" element={<BrandLeaderboard />} />
              <Route path="/class-actions" element={<ClassActionHub />} />
              <Route
                path="/my-complaints"
                element={
                  <ProtectedRoute>
                    <MyComplaints />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              {/* Enterprise Partner 1-Click Resolution Desk */}
              <Route path="/partner/resolve" element={<CompanyResolution />} />

              {/* Legal, Compliance & Policy Routes */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/charter" element={<CitizenCharter />} />
              <Route path="/accessibility" element={<AccessibilityStatement />} />
              <Route path="/methodology" element={<BrandMethodology />} />
              <Route path="/contact" element={<ContactSupport />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <InstallAppBanner />
        <AiLegalAssistant />
        <MobileBottomNav />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

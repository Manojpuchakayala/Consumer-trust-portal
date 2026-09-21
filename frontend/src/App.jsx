import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotificationToast from "./components/NotificationToast";
import InstallAppBanner from "./components/InstallAppBanner";

import Home from "./pages/Home";
import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import MyComplaints from "./pages/MyComplaints";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyResolution from "./pages/CompanyResolution";
import BrandLeaderboard from "./pages/BrandLeaderboard";
import ClassActionHub from "./pages/ClassActionHub";

// Legal & Governance Pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CitizenCharter from "./pages/CitizenCharter";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import BrandMethodology from "./pages/BrandMethodology";
import ContactSupport from "./pages/ContactSupport";

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
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <NotificationToast />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterComplaint />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/brands" element={<BrandLeaderboard />} />
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
        </main>
        <InstallAppBanner />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

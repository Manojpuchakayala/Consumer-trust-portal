import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import MyComplaints from "./pages/MyComplaints";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

// Route guard for authenticated users (Consumers)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("consumerTrustToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Strict Route guard for Authorized Administrator only
const AUTHORIZED_ADMIN_EMAILS = [
  "manojpuchakayala321@gmail.com",
  "admin@consumertrust.gov",
];

function AdminRoute({ children }) {
  const token = localStorage.getItem("consumerTrustToken");
  const user = JSON.parse(localStorage.getItem("consumerTrustUser") || "null");

  if (!token || !user) {
    return <Navigate to="/login?portal=admin" replace />;
  }

  const userEmail = (user.email || "").toLowerCase().trim();
  if (user.role !== "admin" || !AUTHORIZED_ADMIN_EMAILS.includes(userEmail)) {
    return <Navigate to="/my-complaints" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterComplaint />} />
            <Route path="/track" element={<TrackComplaint />} />
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
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;


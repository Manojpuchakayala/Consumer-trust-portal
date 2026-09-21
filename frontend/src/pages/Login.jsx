import { useSearchParams, Link } from "react-router-dom";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import AuthCard from "../components/AuthCard";
import "./Login.css";

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  return (
    <div className="login-page-root">
      <div className="login-page-container">
        {/* Top Return Link */}
        <div className="login-top-bar">
          <Link to="/" className="login-back-home">
            <FaArrowLeft /> Back to Home Portal
          </Link>
          <div className="login-brand-tag">
            <FaShieldAlt /> Independent Consumer Desk
          </div>
        </div>

        {/* Central AuthCard Container */}
        <div className="login-card-wrapper">
          <AuthCard initialMode={initialMode} showAdminSwitch={true} />
        </div>
      </div>
    </div>
  );
}

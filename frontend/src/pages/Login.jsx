import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("admin@campuslink.local"),
    [password, setPassword] = useState("Admin@123"),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="login-card auth-card">
        <div className="brand big">
          <Sparkles size={22} /> CAMPUSLINK
        </div>
        <span className="eyebrow">PLACEMENT OPERATING SYSTEM</span>
        <h1>Welcome back.</h1>
        <p className="muted">
          Sign in to continue your campus placement journey.
        </p>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="primary wide" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
            <ArrowRight size={17} />
          </button>
        </form>
        <div className="demo-note">
          <b>Demo accounts</b>
          <span>admin / recruiter / student credentials are in README.</span>
        </div>
        <p className="auth-switch">
          New to CAMPUSLINK? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

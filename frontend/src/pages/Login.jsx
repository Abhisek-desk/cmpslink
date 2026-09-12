import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("admin@campuslink.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try { await login(email, password); navigate("/"); } catch (err) { setError(err.response?.data?.message || "Login failed"); }
  }
  return <div className="login-page"><form className="login-card card" onSubmit={submit}>
    <div className="brand big">✦ CAMPUSLINK</div><h1>Welcome back</h1><p className="muted">AI-powered placement management</p>
    <label>Email<input value={email} onChange={e => setEmail(e.target.value)}/></label>
    <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)}/></label>
    {error && <div className="error">{error}</div>}<button className="primary">Sign in</button>
    <small className="muted">Demo: admin / recruiter / student credentials are in README.</small>
  </form></div>
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try { await register(form); navigate("/"); }
    catch (err) { setError(err.response?.data?.message || "Could not create account"); }
    finally { setLoading(false); }
  }

  return <div className="auth-page">
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="brand white"><Sparkles size={22}/> CAMPUSLINK</div>
        <div className="visual-copy"><span className="eyebrow">CAMPUS → CORPORATE</span><h1>Turn your profile into a placement advantage.</h1><p>Build readiness, discover better-fit roles and use AI to close your skill gaps.</p></div>
        <div className="feature-stack"><div><ShieldCheck/> <span>Secure role-based access</span></div><div><Sparkles/> <span>AI-assisted career insights</span></div><div><ArrowRight/> <span>One connected placement journey</span></div></div>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">GET STARTED</span><h2>Create your account</h2><p className="muted">Join your campus placement workspace.</p>
        <label>Full name<input required value={form.name} onChange={e=>update("name",e.target.value)} placeholder="Aarav Sharma"/></label>
        <label>Email<input required type="email" value={form.email} onChange={e=>update("email",e.target.value)} placeholder="you@example.com"/></label>
        <label>Password<input required minLength={6} type="password" value={form.password} onChange={e=>update("password",e.target.value)} placeholder="At least 6 characters"/></label>
        <div className="role-picker"><button type="button" className={form.role === "student" ? "role-choice selected" : "role-choice"} onClick={()=>update("role","student")}><GraduationCap/><b>Student</b><small>Find roles & improve readiness</small></button><button type="button" className={form.role === "recruiter" ? "role-choice selected" : "role-choice"} onClick={()=>update("role","recruiter")}><BriefcaseBusiness/><b>Recruiter</b><small>Post jobs & find candidates</small></button></div>
        {error && <div className="error">{error}</div>}
        <button className="primary wide" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  </div>
}

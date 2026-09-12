import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import StatCard from "../components/StatCard.jsx";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => { if (user?.role !== "student") api.get("/analytics/dashboard").then(r => setData(r.data)); }, [user]);
  if (user?.role === "student") return <StudentHome />;
  if (!data) return <div className="loading">Loading dashboard…</div>;
  return <section>
    <div className="grid four"><StatCard label="Total Students" value={data.totalStudents} hint="Registered profiles"/><StatCard label="Placement Ready" value={data.placementReady} hint="Readiness ≥ 60"/><StatCard label="Offers" value={data.offers} hint={`${data.placed} accepted/joined`}/><StatCard label="At Risk" value={data.atRisk} hint="Needs intervention"/></div>
    <div className="grid two">
      <div className="card"><h2>Branch readiness</h2><ResponsiveContainer width="100%" height={300}><BarChart data={data.branchReadiness}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="branch"/><YAxis/><Tooltip/><Bar dataKey="conversion"/></BarChart></ResponsiveContainer></div>
      <div className="card"><h2>Pipeline snapshot</h2><div className="pipeline"><p>Upcoming drives <b>{data.upcomingDrives}</b></p><p>Applications <b>{data.applications}</b></p><p>Average CTC <b>₹{data.averageCTC} LPA</b></p><p>Students needing help <b>{data.atRisk}</b></p></div></div>
    </div>
  </section>
}

function StudentHome() {
  const [profile, setProfile] = useState(null);
  useEffect(() => { api.get("/students/me").then(r => setProfile(r.data)); }, []);
  return <section><div className="hero card"><div><span className="pill">AI READY</span><h2>Your placement journey</h2><p>Build your profile, close skill gaps and find the best-fit drives.</p></div><div className="score-ring">{profile?.readinessScore ?? "—"}<small>/100</small></div></div><div className="grid three"><StatCard label="Readiness" value={profile?.readinessLevel || "Loading"} hint="Continuously updated"/><StatCard label="Skills" value={profile?.skills?.length || 0} hint="Profile skills"/><StatCard label="Target roles" value={profile?.targetRoles?.length || 0} hint="Career targets"/></div></section>
}

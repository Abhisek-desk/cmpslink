import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function Profile() {
  const [p, setP] = useState(null);
  const [skills, setSkills] = useState("");
  useEffect(() => { api.get("/students/me").then(r => { setP(r.data); setSkills((r.data.skills || []).join(", ")); }); }, []);
  async function save(e) {
    e.preventDefault();
    const body = { ...p, skills: skills.split(",").map(s => s.trim()).filter(Boolean) };
    const { data } = await api.put("/students/me", body); setP(data);
  }
  if (!p) return <div>Loading…</div>;
  return <section><div className="card"><h2>Student readiness profile</h2><form className="form-grid" onSubmit={save}>
    <label>Branch<input value={p.branch || ""} onChange={e => setP({...p, branch:e.target.value})}/></label>
    <label>CGPA<input type="number" step=".01" value={p.cgpa || 0} onChange={e => setP({...p, cgpa:Number(e.target.value)})}/></label>
    <label>Backlogs<input type="number" value={p.backlogs || 0} onChange={e => setP({...p, backlogs:Number(e.target.value)})}/></label>
    <label>Aptitude score<input type="number" value={p.aptitudeScore || 0} onChange={e => setP({...p, aptitudeScore:Number(e.target.value)})}/></label>
    <label>Interview score<input type="number" value={p.interviewScore || 0} onChange={e => setP({...p, interviewScore:Number(e.target.value)})}/></label>
    <label>Communication score<input type="number" value={p.communicationScore || 0} onChange={e => setP({...p, communicationScore:Number(e.target.value)})}/></label>
    <label className="full">Skills (comma separated)<input value={skills} onChange={e => setSkills(e.target.value)}/></label>
    <div className="full"><button className="primary">Save & recalculate readiness</button></div>
  </form></div></section>
}

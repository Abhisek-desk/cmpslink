import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState(null);
  const [form, setForm] = useState({ companyName:"DemoTech", role:"Software Engineer", description:"", requiredSkills:"React, Node.js, SQL", minimumCGPA:7.5, eligibleBranches:"CSE, IT" });
  useEffect(() => { api.get("/jobs").then(r => setJobs(r.data)); }, []);
  async function create(e) {
    e.preventDefault();
    const payload = {...form, requiredSkills:form.requiredSkills.split(",").map(x=>x.trim()), eligibleBranches:form.eligibleBranches.split(",").map(x=>x.trim())};
    const {data}=await api.post("/jobs", payload); setJobs([data,...jobs]);
  }
  async function match(id) { const {data}=await api.get(`/matching/job/${id}`); setMatches(data); }
  return <section><div className="grid two">
    {(user?.role==="admin" || user?.role==="recruiter") && <form className="card" onSubmit={create}><h2>Create job</h2>{Object.keys(form).map(k=><label key={k}>{k}<input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}<button className="primary">Create</button></form>}
    <div className="card"><h2>Active opportunities</h2>{jobs.map(j=><div className="list-row" key={j._id}><div><b>{j.companyName} — {j.role}</b><p className="muted">{j.requiredSkills?.join(" · ")}</p></div>{user?.role!=="student" && <button onClick={()=>match(j._id)}>AI Match</button>}</div>)}</div>
  </div>{matches && <div className="card"><h2>AI-ready candidate ranking</h2>{matches.results.map((r,i)=><div className="candidate" key={r.student._id}><div><b>#{i+1} {r.student.userId?.name}</b><p>{r.explanation}</p></div><strong>{r.finalMatchScore}%</strong></div>)}</div>}</section>
}

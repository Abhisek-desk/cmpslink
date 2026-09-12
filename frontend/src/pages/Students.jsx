import { useEffect, useState } from "react";
import api from "../services/api.js";
export default function Students() {
  const [students,setStudents]=useState([]);
  useEffect(()=>{api.get("/students").then(r=>setStudents(r.data))},[]);
  return <section><div className="card"><h2>Student readiness</h2><table><thead><tr><th>Name</th><th>Branch</th><th>CGPA</th><th>Skills</th><th>Readiness</th></tr></thead><tbody>{students.map(s=><tr key={s._id}><td>{s.userId?.name}</td><td>{s.branch}</td><td>{s.cgpa}</td><td>{s.skills?.slice(0,4).join(", ")}</td><td><span className="pill">{s.readinessScore} — {s.readinessLevel}</span></td></tr>)}</tbody></table></div></section>
}

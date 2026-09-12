import { useEffect, useState } from "react";
import api from "../services/api.js";
export default function Drives() {
 const [drives,setDrives]=useState([]),[conflicts,setConflicts]=useState([]);
 useEffect(()=>{api.get("/drives").then(r=>setDrives(r.data)); api.get("/drives/conflicts").then(r=>setConflicts(r.data));},[]);
 return <section><div className="card"><h2>Drive schedule</h2>{drives.map(d=><div className="list-row" key={d._id}><div><b>{d.companyName} — {d.role}</b><p>{new Date(d.date).toLocaleDateString()} · {d.startTime}-{d.endTime} · {d.venue}</p></div></div>)}</div><div className="card"><h2>Conflict detector</h2>{conflicts.length ? conflicts.map((c,i)=><div className="error" key={i}>{c.reason}: {c.driveA.companyName} ↔ {c.driveB.companyName}</div>) : <p>No drive conflicts detected.</p>}</div></section>
}

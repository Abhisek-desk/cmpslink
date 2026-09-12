import { useEffect, useState } from "react";
import api from "../services/api.js";
export default function Offers() {
 const [offers,setOffers]=useState([]);
 useEffect(()=>{api.get("/offers").then(r=>setOffers(r.data));},[]);
 return <section><div className="card"><h2>Offer & documentation tracking</h2><table><thead><tr><th>Company</th><th>Role</th><th>CTC</th><th>Status</th><th>Joining</th></tr></thead><tbody>{offers.map(o=><tr key={o._id}><td>{o.companyName}</td><td>{o.role}</td><td>₹{o.ctc} LPA</td><td><span className="pill">{o.status}</span></td><td>{o.joiningDate ? new Date(o.joiningDate).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div></section>
}

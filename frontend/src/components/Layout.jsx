import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, BriefcaseBusiness, CalendarDays, FileCheck2, GraduationCap, LogOut, Sparkles, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const links = user?.role === "student"
    ? [["/", "Dashboard", BarChart3], ["/profile", "My Profile", GraduationCap], ["/jobs", "Opportunities", BriefcaseBusiness], ["/offers", "Offers", FileCheck2]]
    : [["/", "Dashboard", BarChart3], ["/students", "Students", Users], ["/jobs", "Jobs", BriefcaseBusiness], ["/drives", "Drives", CalendarDays], ["/offers", "Offers", FileCheck2]];
  return <div className="app">
    <aside>
      <div className="brand"><Sparkles size={22}/> CAMPUSLINK</div>
      <div className="role">{user?.role?.toUpperCase()}</div>
      <nav>{links.map(([path, label, Icon]) => <NavLink key={path} to={path}><Icon size={18}/>{label}</NavLink>)}</nav>
      <button className="logout" onClick={logout}><LogOut size={18}/> Logout</button>
    </aside>
    <main><header><div><h1>Placement Command Center</h1><p>Campus-to-corporate workflow</p></div><div className="avatar">{user?.name?.[0]}</div></header><Outlet/></main>
  </div>
}

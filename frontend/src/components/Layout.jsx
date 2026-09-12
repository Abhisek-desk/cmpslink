import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  FileCheck2,
  GraduationCap,
  LogOut,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const links =
    user?.role === "student"
      ? [
          ["/", "Dashboard", BarChart3],
          ["/profile", "My Profile", GraduationCap],
          ["/ai", "AI Copilot", Bot],
          ["/jobs", "Opportunities", BriefcaseBusiness],
          ["/offers", "Offers", FileCheck2],
        ]
      : [
          ["/", "Dashboard", BarChart3],
          ["/students", "Students", Users],
          ["/jobs", "Jobs", BriefcaseBusiness],
          ["/drives", "Drives", CalendarDays],
          ["/offers", "Offers", FileCheck2],
        ];
  return (
    <div className="app">
      <aside>
        <div className="brand">
          <Sparkles size={22} /> CAMPUSLINK
        </div>
        <div className="role">{user?.role?.toUpperCase()} WORKSPACE</div>
        <nav>
          {links.map(([path, label, Icon]) => (
            <NavLink key={path} to={path}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-profile">
            <div className="avatar">{user?.name?.[0]}</div>
            <div>
              <b>{user?.name}</b>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="logout" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <div className="header-kicker">
              <span></span> PLACEMENT COMMAND CENTER
            </div>
            <h1>
              {user?.role === "student"
                ? "Build your placement edge"
                : "Campus-to-corporate workflow"}
            </h1>
            <p>
              {user?.role === "student"
                ? "Your profile, opportunities and AI guidance in one place."
                : "Manage talent, drives and outcomes from one workspace."}
            </p>
          </div>
          <div className="avatar header-avatar">{user?.name?.[0]}</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Jobs from "./pages/Jobs.jsx";
import Students from "./pages/Students.jsx";
import Drives from "./pages/Drives.jsx";
import Offers from "./pages/Offers.jsx";
import AICenter from "./pages/AICenter.jsx";

function Private({ children }) { const { user } = useAuth(); return user ? children : <Navigate to="/login" replace />; }
function AppRoutes() { return <Routes><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route element={<Private><Layout/></Private>}><Route path="/" element={<Dashboard/>}/><Route path="/profile" element={<Profile/>}/><Route path="/ai" element={<AICenter/>}/><Route path="/jobs" element={<Jobs/>}/><Route path="/students" element={<Students/>}/><Route path="/drives" element={<Drives/>}/><Route path="/offers" element={<Offers/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>; }
export default function App(){ return <AuthProvider><AppRoutes/></AuthProvider> }

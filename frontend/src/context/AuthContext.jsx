import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("campuslink_user") || "null"));
  async function login(email, password) { const { data } = await api.post("/auth/login", { email, password }); localStorage.setItem("campuslink_token", data.token); localStorage.setItem("campuslink_user", JSON.stringify(data.user)); setUser(data.user); }
  async function register(payload) { const { data } = await api.post("/auth/register", payload); localStorage.setItem("campuslink_token", data.token); localStorage.setItem("campuslink_user", JSON.stringify(data.user)); setUser(data.user); }
  function logout() { localStorage.removeItem("campuslink_token"); localStorage.removeItem("campuslink_user"); setUser(null); }
  return <AuthContext.Provider value={useMemo(() => ({ user, login, register, logout }), [user])}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";

function token(user) { return jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" }); }

export async function register(req, res) {
  try {
    const { name, email, password, role = "student" } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (!["student", "recruiter"].includes(role)) return res.status(400).json({ message: "Registration is available for students and recruiters" });
    if (await User.findOne({ email: email.toLowerCase().trim() })) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: await bcrypt.hash(password, 10), role });
    if (role === "student") await Student.create({ userId: user._id });
    res.status(201).json({ token: token(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
}

export async function login(req, res) {
  try { const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() }); if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Invalid credentials" }); res.json({ token: token(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } }); }
  catch (e) { res.status(500).json({ message: e.message }); }
}

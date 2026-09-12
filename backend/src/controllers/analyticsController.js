import Student from "../models/Student.js";
import Offer from "../models/Offer.js";
import Drive from "../models/Drive.js";
import Application from "../models/Application.js";

export async function dashboard(req, res) {
  const [students, offers, drives, applications] = await Promise.all([
    Student.find(), Offer.find(), Drive.find(), Application.find()
  ]);
  const placed = offers.filter(o => ["accepted", "joined"].includes(o.status)).length;
  const ready = students.filter(s => s.readinessScore >= 60).length;
  const atRisk = students.filter(s => s.readinessScore < 40).length;
  const avgCtc = offers.length ? offers.reduce((a, o) => a + (o.ctc || 0), 0) / offers.length : 0;
  const branches = {};
  students.forEach(s => {
    branches[s.branch || "Unknown"] ||= { total: 0, ready: 0 };
    branches[s.branch || "Unknown"].total++;
    if (s.readinessScore >= 60) branches[s.branch || "Unknown"].ready++;
  });
  res.json({
    totalStudents: students.length,
    placementReady: ready,
    offers: offers.length,
    placed,
    upcomingDrives: drives.filter(d => d.status === "upcoming").length,
    atRisk,
    averageCTC: Number(avgCtc.toFixed(2)),
    applications: applications.length,
    branchReadiness: Object.entries(branches).map(([branch, v]) => ({
      branch, conversion: v.total ? Math.round(v.ready / v.total * 100) : 0
    }))
  });
}

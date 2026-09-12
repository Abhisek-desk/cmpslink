export default function StatCard({ label, value, hint }) {
  return <div className="card stat"><div className="muted">{label}</div><div className="stat-value">{value}</div><div className="muted">{hint}</div></div>
}

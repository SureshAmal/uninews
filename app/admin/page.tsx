import { getAdminStats } from "@/app/actions/admin";
import { Users, FileText, Star } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: <Users size={24} color="var(--accent)" /> },
    { label: "Total Posts", value: stats.totalPosts, icon: <FileText size={24} color="var(--success)" /> },
    { label: "Total Reviews", value: stats.totalReviews, icon: <Star size={24} color="var(--warning)" /> },
  ];

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>
        Dashboard Overview
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "var(--radius-md)",
                background: "var(--bg-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", margin: 0, fontWeight: 500 }}>
                {card.label}
              </p>
              <p style={{ fontSize: "2rem", fontFamily: "var(--font-heading)", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

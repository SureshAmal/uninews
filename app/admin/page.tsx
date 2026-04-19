import { getAdminStats } from "@/app/actions/admin";
import { Users, FileText, Star } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: <Users size={24} className="stat-icon-users" /> },
    { label: "Total Posts", value: stats.totalPosts, icon: <FileText size={24} className="stat-icon-posts" /> },
    { label: "Total Reviews", value: stats.totalReviews, icon: <Star size={24} className="stat-icon-reviews" /> },
  ];

  return (
    <div className="admin-dashboard-container animate-fade-in">
      <h1 className="headline-large mb-8">
        Dashboard Overview
      </h1>

      <div className="admin-grid">
        {cards.map((card, idx) => (
          <div key={idx} className="card admin-stat-card">
            <div className="admin-stat-icon-box">
              {card.icon}
            </div>
            <div>
              <p className="admin-stat-label">
                {card.label}
              </p>
              <p className="admin-stat-value">
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  CheckCircle,
  XCircle,
  ClipboardList,
  Clock,
  Trophy,
  Calendar,
  Download,
  MessageCircle,
  Star,
  CheckSquare,
  UserPlus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getDashboardStats,
  getDashboardChart,
  getDashboardActivity,
} from "../../api/mentorApi";

export default function MentorDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChart] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getDashboardChart(),
      getDashboardActivity(),
    ])
      .then(([statsData, chartData, activityData]) => {
        setStats(statsData);
        setChart(chartData);
        setActivities(activityData.notifications);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  if (loading) {
    return (
      <div className="md-loading">
        <span className="md-spinner" />
        Chargement du dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="md-loading" style={{ color: "#ef4444" }}>
        Erreur : {error}
      </div>
    );
  }
  // Mapping API response → cards affichées
  const statCards = [
    {
      label: "Total Demandes",
      value: stats.total_requests, // ← vient du backend
      icon: FolderKanban,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
      border: "#3b82f6",
    },
    {
      label: "Acceptés",
      value: stats.accepted_requests, // ← vient du backend
      icon: CheckCircle,
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
      border: "#10b981",
    },
    {
      label: "Rejetés",
      value: stats.rejected_requests, // ← vient du backend
      icon: XCircle,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      border: "#ef4444",
    },
    {
      label: "Évalués",
      value: stats.evaluated_projects, // ← vient du backend
      icon: ClipboardList,
      color: "#0F4C81",
      bg: "rgba(15,76,129,0.1)",
      border: "#0F4C81",
    },
    {
      label: "Non Évalués",
      value: stats.not_evaluated_projects, // ← vient du backend
      icon: Clock,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "#f59e0b",
    },
    {
      label: "Projets Gagnants",
      value: stats.winning_projects, // ← vient du backend
      icon: Trophy,
      color: "#c9a84c",
      bg: "rgba(201,168,76,0.1)",
      border: "#c9a84c",
    },
  ];

  // Calcul progression milestone
  const milestoneTotal = 20;
  const milestoneValue = Math.min(stats.evaluated_projects, milestoneTotal);
  const milestonePercent = Math.round((milestoneValue / milestoneTotal) * 100);
  const remaining = milestoneTotal - milestoneValue;

  return (
    <div className="md-root">
      {/* Header, Stats — identiques */}
      {/* Stats — données réelles */}
      <div className="md-stats">
        {statCards.map(({ label, value, icon: Icon, color, bg, border }, i) => (
          <div
            className="md-stat"
            key={label}
            style={{ borderTopColor: border, animationDelay: `${i * 0.07}s` }}
          >
            <div className="md-stat__icon" style={{ background: bg }}>
              <Icon size={18} color={color} strokeWidth={1.8} />
            </div>
            <div className="md-stat__label">{label}</div>
            <div className="md-stat__value" style={{ color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart — données réelles */}
      <div className="md-row md-row--wide">
        <div className="md-card">
          <div className="md-card__head">
            <div>
              <div className="md-card__title">Soumissions de Projets</div>
              <div className="md-card__sub">Aperçu des 6 derniers mois</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf4" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2eaf4",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="soumis"
                name="Soumis"
                stroke="#0F4C81"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="evalues"
                name="Évalués"
                stroke="#0ea5e9"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activité récente — données réelles */}
        <div className="md-card">
          <div className="md-card__head">
            <div className="md-card__title">Demandes Récentes</div>
            <a href="#" className="md-view-all">
              Voir tout
            </a>
          </div>
          <div className="md-activity">
            {activities.length === 0 ? (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  padding: "12px 0",
                }}
              >
                Aucune demande en attente.
              </p>
            ) : (
              activities.slice(0, 4).map((req, i) => (
                <div className="md-activity__item" key={req.id || i}>
                  <div
                    className="md-activity__icon"
                    style={{
                      background: "rgba(59,130,246,0.1)",
                      color: "#3b82f6",
                    }}
                  >
                    <UserPlus size={16} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="md-activity__text">
                      {/* nom étudiant si relation chargée */}
                      <strong>
                        {req.userStudent?.profil?.nom
                          ? `${req.userStudent.profil.nom} ${req.userStudent.profil.prenom}`
                          : "Étudiant"}
                      </strong>{" "}
                      — {req.project?.titre ?? "Projet sans titre"}
                    </div>
                    <div className="md-activity__meta">
                      {new Date(req.created_at).toLocaleDateString("fr-FR")}
                      {req.project?.categories?.nom
                        ? ` · ${req.project.categories.nom}`
                        : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

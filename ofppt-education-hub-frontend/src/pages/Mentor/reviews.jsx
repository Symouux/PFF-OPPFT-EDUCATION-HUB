import React, { useState, useEffect } from "react";
import {
  Star,
  Calendar,
  Code2,
  Palette,
  Lightbulb,
  Zap,
  Presentation,
} from "lucide-react";
import axios from "../../api/axios";

export default function MentorReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/mentor/reviews")
      .then((res) => setReviews(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="md-loading">
        <span className="md-spinner" /> Chargement...
      </div>
    );

  return (
    <div className="md-root">
      <div className="md-header">
        <div>
          <h1 className="md-header__title">Mes Évaluations</h1>
          <p className="md-header__sub">
            {reviews.length} évaluation{reviews.length !== 1 ? "s" : ""}{" "}
            soumises
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="mn-empty">
          <Star size={48} strokeWidth={1.2} />
          <h3>Aucune évaluation</h3>
          <p>Vos évaluations soumises apparaîtront ici.</p>
        </div>
      ) : (
        <div className="mn-list">
          {reviews.map((review, i) => (
            <div
              className="md-card"
              key={review.id}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="md-card__head">
                <div>
                  <div className="md-card__title">
                    {review.project?.titre ?? "Projet"}
                  </div>
                  <div className="md-card__sub">
                    {review.project?.categories?.nom ?? "Général"} ·{" "}
                    {new Date(review.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}
                  >
                    {review.final_score}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    / 25
                  </div>
                </div>
              </div>

              {/* Score bars */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  margin: "14px 0",
                }}
              >
                {[
                  {
                    label: "Code Quality",
                    val: review.code_quality,
                    icon: Code2,
                    color: "#3b82f6",
                  },
                  {
                    label: "UI / UX",
                    val: review.ui_ux,
                    icon: Palette,
                    color: "#8b5cf6",
                  },
                  {
                    label: "Innovation",
                    val: review.innovation,
                    icon: Lightbulb,
                    color: "#f59e0b",
                  },
                  {
                    label: "Performance",
                    val: review.performance,
                    icon: Zap,
                    color: "#10b981",
                  },
                  {
                    label: "Presentation",
                    val: review.presentation,
                    icon: Presentation,
                    color: "#0ea5e9",
                  },
                ].map(({ label, val, icon: Icon, color }) => (
                  <div
                    key={label}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Icon size={14} color={color} strokeWidth={1.8} />
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-body)",
                        width: 110,
                      }}
                    >
                      {label}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 6,
                        background: "var(--border)",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(val / 5) * 100}%`,
                          height: "100%",
                          background: color,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color,
                        width: 28,
                        textAlign: "right",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Comment */}
              {review.comment && (
                <div
                  style={{
                    background: "var(--bg-page)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--text-body)",
                    borderLeft: "3px solid var(--accent)",
                    lineHeight: 1.55,
                  }}
                >
                  "{review.comment}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

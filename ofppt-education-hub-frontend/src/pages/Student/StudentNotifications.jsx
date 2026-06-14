import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  Star,
  Clock,
  FolderKanban,
  User,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import axios from "../../api/axios";
import "./StudentNotifications.css";

export default function StudentNotifications() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    axios
      .get("/student/notifications")
      .then((res) => {
        setReviews(res.data.notifications ?? []);
        axios.put("/student/notifications/read").catch(console.error);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const renderScore = (score) => {
    const stars = Math.round(score / 5);
    return "★".repeat(Math.min(stars, 5)) + "☆".repeat(Math.max(5 - stars, 0));
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <span className="sd-spinner" /> Chargement des notifications...
      </div>
    );
  }

  return (
    <div className="sd-root">
      <div className="sd-header">
        <div>
          <h1 className="sd-header__title">Notifications d'évaluation</h1>
          <p className="sd-header__sub">
            {reviews.length} évaluation{reviews.length !== 1 ? "s" : ""} reçue
           {reviews.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="sd-btn" onClick={load}>
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {reviews.length === 0 && (
        <div className="sne-empty">
          <Bell size={48} strokeWidth={1.2} />
          <h3>Aucune évaluation pour le moment</h3>
          <p>
            Les évaluations de vos projets par les mentors apparaîtront ici.
          </p>
        </div>
      )}

      <div className="sne-list">
        {reviews.map((review, i) => {
          const project = review.project;
          const mentor = review.user;
          const finalScore = parseFloat(review.final_score) || 0;

          return (
            <div
              className={`sne-card${!review.is_read ? " sne-card--unread" : ""}`}
              key={review.id}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {!review.is_read && <span className="sne-card__dot" />}

              <div className="sne-card__left">
                <div className="sne-card__avatar">
                  {(mentor?.profil?.nom_complet ??
                    mentor?.email ??
                    "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="sne-card__mentor-name">
                    {mentor?.profil?.nom_complet ??
                      mentor?.email ??
                      "Mentor"}
                  </p>
                  <p className="sne-card__mentor-meta">
                    <Star size={11} /> Mentor
                  </p>
                </div>
              </div>

              <div className="sne-card__divider" />

              <div className="sne-card__project">
                <div className="sne-card__project-head">
                  <span className="sne-card__category">
                    {project?.categories?.name ?? "Général"}
                  </span>
                  <span className="sne-card__date">
                    <Clock size={11} />
                    {new Date(review.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="sne-card__project-title">
                  {project?.titre ?? "Projet sans titre"}
                </h3>

                <div className="sne-card__scores">
                  <div className="sne-card__score-row">
                    <span>Code</span>
                    <span className="sne-card__score-bar">
                      <span
                        className="sne-card__score-fill"
                        style={{ width: `${(review.code_quality / 5) * 100}%` }}
                      />
                    </span>
                    <span>{review.code_quality}/5</span>
                  </div>
                  <div className="sne-card__score-row">
                    <span>UI/UX</span>
                    <span className="sne-card__score-bar">
                      <span
                        className="sne-card__score-fill"
                        style={{ width: `${(review.ui_ux / 5) * 100}%` }}
                      />
                    </span>
                    <span>{review.ui_ux}/5</span>
                  </div>
                  <div className="sne-card__score-row">
                    <span>Innovation</span>
                    <span className="sne-card__score-bar">
                      <span
                        className="sne-card__score-fill"
                        style={{ width: `${(review.innovation / 5) * 100}%` }}
                      />
                    </span>
                    <span>{review.innovation}/5</span>
                  </div>
                  <div className="sne-card__score-row">
                    <span>Performance</span>
                    <span className="sne-card__score-bar">
                      <span
                        className="sne-card__score-fill"
                        style={{ width: `${(review.performance / 5) * 100}%` }}
                      />
                    </span>
                    <span>{review.performance}/5</span>
                  </div>
                  <div className="sne-card__score-row">
                    <span>Présentation</span>
                    <span className="sne-card__score-bar">
                      <span
                        className="sne-card__score-fill"
                        style={{ width: `${(review.presentation / 5) * 100}%` }}
                      />
                    </span>
                    <span>{review.presentation}/5</span>
                  </div>
                </div>

                <div className="sne-card__final">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <strong>
                    {finalScore.toFixed(1)} / 25
                  </strong>
                  <span className="sne-card__stars">
                    {renderScore(finalScore)}
                  </span>
                </div>

                {review.comment && (
                  <p className="sne-card__comment">"{review.comment}"</p>
                )}

                {project?.lienGithub && (
                  <a
                    href={project.lienGithub}
                    target="_blank"
                    rel="noreferrer"
                    className="sne-card__link"
                  >
                    <ExternalLink size={12} /> Voir le repository
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Star,
  Clock,
  CheckCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import axios from "../../api/axios";
import "./MentorProjects.css";

export default function MentorProjects() {
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axios.get("/mentor/accepted-projects"),
      axios.get("/mentor/reviews"),
    ])
      .then(([projRes, revRes]) => {
        setProjects(projRes.data);
        setReviews(revRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isReviewed = (projectId) =>
    reviews.some((r) => r.project_id === projectId);

  if (loading) {
    return (
      <div className="md-loading">
        <span className="md-spinner" /> Chargement des projets...
      </div>
    );
  }

  return (
    <div className="md-root">
      <div className="md-header">
        <div>
          <h1 className="md-header__title">Projets Acceptés</h1>
          <p className="md-header__sub">
            {projects.length} projet{projects.length !== 1 ? "s" : ""} en
            attente d'évaluation
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="mp-empty">
          <FolderKanban size={48} strokeWidth={1.2} />
          <h3>Aucun projet accepté</h3>
          <p>Les projets que vous acceptez apparaîtront ici.</p>
        </div>
      ) : (
        <div className="mp-grid">
          {projects.map((req) => {
            const project = req.project;
            const student = req.userStudent;
            const reviewed = isReviewed(project?.id);

            return (
              <div className="mp-card" key={req.id}>
                {/* Header */}
                <div className="mp-card__head">
                  <div className="mp-card__category">
                    {project?.categories?.nom ?? "Général"}
                  </div>
                  <span
                    className={`md-badge ${reviewed ? "md-badge--success" : "md-badge--warning"}`}
                  >
                    {reviewed ? "✓ Évalué" : "En attente"}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mp-card__title">
                  {project?.titre ?? "Projet sans titre"}
                </h3>
                <p className="mp-card__desc">
                  {project?.description?.slice(0, 100) ?? ""}
                  {project?.description?.length > 100 ? "..." : ""}
                </p>

                {/* Student */}
                <div className="mp-card__student">
                  <div className="mp-card__avatar">
                    {(student?.profil?.nom_complet ??
                      student?.email ??
                      "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="mp-card__student-name">
                      {student?.profil?.nom_complet ??
                        student?.email ??
                        "Étudiant"}
                    </p>
                    <p className="mp-card__student-label">Étudiant</p>
                  </div>
                </div>

                {/* Technologies */}
                {project?.technologies && (
                  <div className="mp-card__techs">
                    {project.technologies
                      .split(",")
                      .slice(0, 3)
                      .map((t) => (
                        <span key={t} className="mp-card__tech">
                          {t.trim()}
                        </span>
                      ))}
                  </div>
                )}

                {/* Links */}
                <div className="mp-card__links">
                  {project?.lienGithub && (
                    <a
                      href={project.lienGithub}
                      target="_blank"
                      rel="noreferrer"
                      className="mp-card__link"
                    >
                      <ExternalLink size={13} /> Repository
                    </a>
                  )}
                </div>

                {/* Footer */}
                <div className="mp-card__footer">
                  {reviewed ? (
                    <button
                      className="mp-btn mp-btn--secondary"
                      onClick={() => navigate(`/mentor/reviews`)}
                    >
                      <Star size={15} /> Voir évaluation
                    </button>
                  ) : (
                    <button
                      className="mp-btn mp-btn--primary"
                      onClick={() =>
                        navigate(`/mentor/review/${project?.id}`, {
                          state: { project, student },
                        })
                      }
                    >
                      <Star size={15} /> Évaluer
                      <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

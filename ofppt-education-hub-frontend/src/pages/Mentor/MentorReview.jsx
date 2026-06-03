import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Code2,
  Palette,
  Lightbulb,
  Zap,
  Presentation,
  MessageSquare,
  ArrowLeft,
  Send,
  ExternalLink,
  Calendar,
  User,
  Trophy,
} from "lucide-react";
import axios from "../../api/axios";
import "./MentorReview.css";

const CRITERIA = [
  { key: "code_quality", label: "Code Quality", icon: Code2, color: "#3b82f6" },
  { key: "ui_ux", label: "UI / UX Design", icon: Palette, color: "#8b5cf6" },
  { key: "innovation", label: "Innovation", icon: Lightbulb, color: "#f59e0b" },
  { key: "performance", label: "Performance", icon: Zap, color: "#10b981" },
  {
    key: "presentation",
    label: "Presentation",
    icon: Presentation,
    color: "#0ea5e9",
  },
];

export default function MentorReview() {
  const { projectId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const project = state?.project;
  const student = state?.student;

  const [scores, setScores] = useState({
    code_quality: 0,
    ui_ux: 0,
    innovation: 0,
    performance: 0,
    presentation: 0,
  });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const average =
    Object.values(scores).reduce((a, b) => a + b, 0) / CRITERIA.length;

  const handleScore = (key, val) => {
    setScores((prev) => ({ ...prev, [key]: parseFloat(val) }));
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Le commentaire est obligatoire.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await axios.post("/mentor/review", {
        project_id: parseInt(projectId),
        code_quality: scores.code_quality,
        ui_ux: scores.ui_ux,
        innovation: scores.innovation,
        performance: scores.performance,
        presentation: scores.presentation,
        comment: comment.trim(),
      });
      navigate("/mentor/projects");
    } catch (err) {
      setError(err.response?.data?.message ?? "Erreur lors de la soumission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mr-root">
      {/* Back button */}
      <button className="mr-back" onClick={() => navigate("/mentor/projects")}>
        <ArrowLeft size={16} /> Retour aux projets
      </button>

      <div className="mr-layout">
        {/* ── LEFT: Form ── */}
        <div className="mr-form-col">
          <div className="md-card">
            {/* Header */}
            <div className="mr-form__head">
              <div>
                <h2 className="mr-form__title">Review Metrics</h2>
                <p className="mr-form__sub">
                  Assess technical proficiency and creative execution.
                </p>
              </div>
              <div className="mr-avg">
                <span className="mr-avg__value">{average.toFixed(1)}</span>
                <span className="mr-avg__label">AVERAGE SCORE</span>
              </div>
            </div>
            {/* Sliders */}
            <div className="mr-criteria">
              {CRITERIA.map(({ key, label, icon: Icon, color }) => (
                <div className="mr-criterion" key={key}>
                  <div className="mr-criterion__label">
                    <Icon size={16} color={color} strokeWidth={1.8} />
                    <span>{label}</span>
                  </div>
                  <div className="mr-criterion__slider-wrap">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={scores[key]}
                      onChange={(e) => handleScore(key, e.target.value)}
                      className="mr-slider"
                      style={{ accentColor: color }}
                    />
                    <div className="mr-slider__labels">
                      <span>0</span>
                      <span>5</span>
                    </div>
                  </div>
                  <span className="mr-criterion__score" style={{ color }}>
                    {scores[key].toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            {/* Comment */}
            <div className="mr-comment">
              <label className="mr-comment__label">
                <MessageSquare size={15} /> Mentor Detailed Feedback
              </label>
              <textarea
                className="mr-comment__input"
                rows={6}
                placeholder="Provide constructive criticism, highlight strengths, and suggest areas for improvement..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            {error && <p className="mr-error">{error}</p>}
            {/* Submit */}
            <button
              className={`mr-submit${submitting ? " mr-submit--loading" : ""}`}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="md-spinner" /> Soumission...
                </>
              ) : (
                <>
                  <Send size={16} /> Complete Evaluation
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Project info ── */}
        <div className="mr-info-col">
          {/* Project card */}
          <div className="md-card mr-project-card">
            {project?.lienGithub && (
              <div className="mr-project-img">
                <span className="mr-project-badge">
                  {project?.categories?.nom ?? "Projet"}
                </span>
              </div>
            )}
            <h3 className="mr-project-title">
              {project?.titre ?? `Projet #${projectId}`}
            </h3>
            {project?.description && (
              <p className="mr-project-desc">{project.description}</p>
            )}

            {/* Student */}
            <div className="mr-student">
              <div className="mr-student__avatar">
                {(student?.profil?.nom_complet ??
                  student?.email ??
                  "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="mr-student__label">Student</p>
                <p className="mr-student__name">
                  {student?.profil?.nom_complet ?? student?.email ?? "Étudiant"}
                </p>
              </div>
            </div>

            <div className="mr-divider" />

            {/* Links */}
            {project?.lienGithub && (
              <a
                href={project.lienGithub}
                target="_blank"
                rel="noreferrer"
                className="mr-link"
              >
                <ExternalLink size={14} /> Repository
              </a>
            )}

            {/* Date */}
            {project?.date_publication && (
              <div className="mr-meta">
                <div className="mr-meta__row">
                  <span className="mr-meta__label">SUBMISSION DATE</span>
                  <p className="mr-meta__value">
                    {new Date(project.date_publication).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Score preview */}
          <div className="md-card mr-score-preview">
            <div className="md-card__head">
              <div className="md-card__title">Score Preview</div>
            </div>
            <div className="mr-score-list">
              {CRITERIA.map(({ key, label, color }) => (
                <div className="mr-score-row" key={key}>
                  <span className="mr-score-row__label">{label}</span>
                  <div className="mr-score-row__bar">
                    <div
                      className="mr-score-row__fill"
                      style={{
                        width: `${(scores[key] / 5) * 100}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <span className="mr-score-row__val" style={{ color }}>
                    {scores[key].toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mr-total">
              <Trophy size={16} color="#c9a84c" />
              <span>Total :</span>
              <strong style={{ color: "#0F4C81" }}>
                {Object.values(scores)
                  .reduce((a, b) => a + b, 0)
                  .toFixed(1)}{" "}
                / 25
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

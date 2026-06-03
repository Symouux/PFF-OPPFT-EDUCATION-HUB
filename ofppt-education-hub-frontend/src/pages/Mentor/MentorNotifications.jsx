import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  FolderKanban,
  User,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import axios from "../../api/axios";
import "./MentorNotifications.css";

export default function MentorNotifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // id en cours de traitement

  const load = () => {
    setLoading(true);
    axios
      .get("/mentor/requests")
      .then((res) => {
        setRequests(res.data.notifications ?? []);
        // Marquer comme lu
        axios.put("/mentor/notifications/read").catch(console.error);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const accept = async (id) => {
    setActionId(id);
    try {
      await axios.put(`/mentor/request/${id}/accept`);
      // Retire la demande de la liste après acceptation
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.message ?? "Erreur lors de l'acceptation.");
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id) => {
    setActionId(id);
    try {
      await axios.put(`/mentor/request/${id}/reject`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.message ?? "Erreur lors du rejet.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="md-loading">
        <span className="md-spinner" /> Chargement des notifications...
      </div>
    );
  }

  return (
    <div className="md-root">
      {/* Header */}
      <div className="md-header">
        <div>
          <h1 className="md-header__title">Notifications</h1>
          <p className="md-header__sub">
            {requests.length} demande{requests.length !== 1 ? "s" : ""} en
            attente
          </p>
        </div>
        <button className="md-btn" onClick={load}>
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {/* Empty */}
      {requests.length === 0 && (
        <div className="mn-empty">
          <Bell size={48} strokeWidth={1.2} />
          <h3>Aucune demande en attente</h3>
          <p>Les nouvelles demandes de mentorat apparaîtront ici.</p>
        </div>
      )}

      {/* List */}
      <div className="mn-list">
        {requests.map((req, i) => {
          const project = req.project;
          const student = req.userStudent;
          const isLoading = actionId === req.id;

          return (
            <div
              className={`mn-card${!req.is_read ? " mn-card--unread" : ""}`}
              key={req.id}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Unread dot */}
              {!req.is_read && <span className="mn-card__dot" />}

              {/* Left: Student info */}
              <div className="mn-card__left">
                <div className="mn-card__avatar">
                  {(student?.profil?.nom_complet ??
                    student?.email ??
                    "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="mn-card__student-name">
                    {student?.profil?.nom_complet ??
                      student?.email ??
                      "Étudiant"}
                  </p>
                  <p className="mn-card__student-meta">
                    <User size={11} /> Étudiant
                  </p>
                </div>
              </div>

              <div className="mn-card__divider" />

              {/* Center: Project info */}
              <div className="mn-card__project">
                <div className="mn-card__project-head">
                  <span className="mn-card__category">
                    {project?.categories?.nom ?? "Général"}
                  </span>
                  <span className="mn-card__date">
                    <Clock size={11} />
                    {new Date(req.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="mn-card__project-title">
                  {project?.titre ?? "Projet sans titre"}
                </h3>
                <p className="mn-card__project-desc">
                  {project?.description?.slice(0, 120) ?? ""}
                  {project?.description?.length > 120 ? "..." : ""}
                </p>

                {/* Technologies */}
                {project?.technologies && (
                  <div className="mn-card__techs">
                    {project.technologies
                      .split(",")
                      .slice(0, 4)
                      .map((t) => (
                        <span key={t} className="mn-card__tech">
                          {t.trim()}
                        </span>
                      ))}
                  </div>
                )}

                {/* GitHub link */}
                {project?.lienGithub && (
                  <a
                    href={project.lienGithub}
                    target="_blank"
                    rel="noreferrer"
                    className="mn-card__link"
                  >
                    <ExternalLink size={12} /> Voir le repository
                  </a>
                )}
              </div>

              {/* Right: Actions */}
              <div className="mn-card__actions">
                <button
                  className="mn-btn mn-btn--accept"
                  onClick={() => accept(req.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span
                      className="md-spinner"
                      style={{ borderTopColor: "#fff", width: 14, height: 14 }}
                    />
                  ) : (
                    <>
                      <CheckCircle size={15} /> Accepter
                    </>
                  )}
                </button>
                <button
                  className="mn-btn mn-btn--reject"
                  onClick={() => reject(req.id)}
                  disabled={isLoading}
                >
                  <XCircle size={15} /> Rejeter
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

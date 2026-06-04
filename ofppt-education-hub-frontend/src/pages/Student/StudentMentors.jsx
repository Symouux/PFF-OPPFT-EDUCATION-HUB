import React, { useState, useEffect } from "react";
import { UserCheck, Clock, CheckCircle, XCircle, Send, PlusCircle } from "lucide-react";
import {
  getMentors,
  getProjects,
  getMentorRequests,
  createMentorRequest,
} from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";
import "./Student.css";

export default function StudentMentors() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Request Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getMentors(), getProjects(), getMentorRequests()])
      .then(([mentorRes, projectRes, requestRes]) => {
        setMentors(mentorRes.data || []);
        // own projects
        const allProj = projectRes.data || [];
        const studentId = user?.user?.id;
        const ownProj = allProj.filter((p) => p.utilisateur_id === studentId);
        setMyProjects(ownProj);
        setRequests(requestRes.data || []);
      })
      .catch((err) => setError(err.message || "Erreur de chargement"))
      .finally(() => setLoading(false));
  };

  const handleOpenRequest = (mentor) => {
    if (!mentor.mentor_profile?.is_available && mentor.mentorProfile?.is_available === false) {
      alert("Ce mentor n'est pas disponible actuellement.");
      return;
    }

    const mentorCatId = mentor.mentor_profile?.category_id || mentor.mentor_profile?.category_id;
    // Filter own projects that have the same category as the mentor
    const matchingProjects = myProjects.filter(
      (p) => String(p.category_id) === String(mentor.mentor_profile?.category_id || mentor.mentor_profile?.category_id || mentor.mentor_profile?.category_id)
    );

    setSelectedMentor(mentor);
    setSelectedProject(myProjects[0]?.id || "");
    setModalError("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMentor(null);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      setModalError("Veuillez sélectionner un projet.");
      return;
    }

    setSubmitting(true);
    setModalError("");

    try {
      await createMentorRequest(selectedProject, selectedMentor.id);
      handleCloseModal();
      fetchData(); // reload
      alert("Demande de mentorat envoyée avec succès !");
    } catch (err) {
      setModalError(
        err.response?.data?.message || "Erreur lors de l'envoi de la demande."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return (
          <span
            className="mentor-card__status"
            style={{ background: "rgba(16,185,129,0.12)", color: "var(--success)" }}
          >
            <CheckCircle size={12} />
            <span>Acceptée</span>
          </span>
        );
      case "rejected":
        return (
          <span
            className="mentor-card__status"
            style={{ background: "rgba(239,68,68,0.12)", color: "var(--danger)" }}
          >
            <XCircle size={12} />
            <span>Refusée</span>
          </span>
        );
      default:
        return (
          <span
            className="mentor-card__status"
            style={{ background: "rgba(245,158,11,0.12)", color: "var(--warning)" }}
          >
            <Clock size={12} />
            <span>En attente</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <span className="sd-spinner" />
        Chargement des mentors...
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-loading" style={{ color: "var(--danger)" }}>
        Erreur : {error}
      </div>
    );
  }

  return (
    <div className="sd-root">
      {/* Header */}
      <div className="sd-header">
        <div>
          <h1 className="sd-header__title">Accompagnement Mentorat</h1>
          <p className="sd-header__sub">
            Sélectionnez un expert pour guider vos projets d'apprentissage
          </p>
        </div>
      </div>

      <div className="md-row md-row--wide">
        {/* Mentors Directory */}
        <div>
          <h2
            style={{
              fontFamily: "Syne",
              fontSize: "18px",
              color: "var(--primary)",
              marginBottom: "16px",
            }}
          >
            Annuaire des Mentors
          </h2>
          {mentors.length === 0 ? (
            <div className="sd-card" style={{ textAlign: "center", padding: "30px" }}>
              Aucun mentor disponible pour le moment.
            </div>
          ) : (
            <div className="mentor-grid">
              {mentors.map((mentor, i) => {
                const isAvail = mentor.mentor_profile?.is_available ?? true;
                return (
                  <div
                    className="sd-card mentor-card"
                    key={mentor.id}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="mentor-card__avatar">
                      {mentor.profil?.nom_complet
                        ? mentor.profil.nom_complet[0].toUpperCase()
                        : "M"}
                    </div>
                    <h3 className="mentor-card__name">
                      {mentor.profil?.nom_complet || "Nom Inconnu"}
                    </h3>
                    <span className="mentor-card__category">
                      {mentor.mentor_profile?.categories?.name || "Spécialiste"}
                    </span>
                    <p className="mentor-card__bio">
                      {mentor.profil?.bio || "Aucune description fournie par ce mentor."}
                    </p>

                    <div
                      className={`mentor-card__status ${
                        isAvail ? "mentor-card__status--available" : "mentor-card__status--unavailable"
                      }`}
                    >
                      {isAvail ? "Disponible" : "Indisponible"}
                    </div>

                    <button
                      className="sd-btn sd-btn--primary"
                      disabled={!isAvail}
                      onClick={() => handleOpenRequest(mentor)}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <PlusCircle size={14} />
                      <span>Demander Suivi</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Requests tracker */}
        <div>
          <h2
            style={{
              fontFamily: "Syne",
              fontSize: "18px",
              color: "var(--primary)",
              marginBottom: "16px",
            }}
          >
            Suivi des Demandes
          </h2>
          <div className="sd-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {requests.length === 0 ? (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                Aucune demande envoyée pour l'instant.
              </p>
            ) : (
              requests.map((req, i) => (
                <div
                  key={req.id || i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "12px 0",
                    borderBottom: i < requests.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-dark)" }}>
                      {req.project?.titre || "Projet sans titre"}
                    </span>
                    {getStatusBadge(req.status)}
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Mentor : {req.user_mentor?.profil?.nom_complet || "Mentor"}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Demandé le : {new Date(req.created_at || new Date()).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mentor Request Dialog */}
      {modalOpen && selectedMentor && (
        <div className="sd-modal-overlay" onClick={handleCloseModal}>
          <form
            className="sd-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmitRequest}
          >
            <div className="sd-modal__head">
              <h3 className="sd-modal__title">Demande de mentorat</h3>
              <button
                type="button"
                className="sd-modal__close"
                onClick={handleCloseModal}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="sd-modal__body">
              {modalError && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "var(--danger)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "13px",
                    marginBottom: "16px",
                  }}
                >
                  {modalError}
                </div>
              )}

              <p style={{ fontSize: "13px", color: "var(--text-body)", marginBottom: "18px" }}>
                Vous demandez l'accompagnement de{" "}
                <strong>{selectedMentor.profil?.nom_complet}</strong> pour l'un de vos projets. Le
                mentor recevra une notification et pourra valider ou refuser votre demande.
              </p>

              <div className="sd-form-group">
                <label className="sd-label">Sélectionner votre Projet</label>
                {myProjects.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--danger)", fontWeight: "600" }}>
                    Aucun projet disponible. Vous devez publier un projet d'abord !
                  </p>
                ) : (
                  <select
                    className="sd-select"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      -- Choisir un projet --
                    </option>
                    {myProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.titre} ({p.technologies})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="sd-modal__foot">
              <button type="button" className="sd-btn" onClick={handleCloseModal}>
                Annuler
              </button>
              <button
                type="submit"
                className="sd-btn sd-btn--primary"
                disabled={submitting || myProjects.length === 0}
                style={{ display: "flex", gap: "6px", alignItems: "center" }}
              >
                <Send size={13} />
                <span>{submitting ? "Envoi..." : "Envoyer la demande"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

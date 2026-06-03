import React, { useState } from "react";
import { User, Mail, Award, Calendar, Link2, Github, Linkedin, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";
import "./Student.css";

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    nom_complet: user?.profil?.nom_complet || "",
    bio: user?.profil?.bio || "",
    lien_linkedin: user?.profil?.lien_linkedin || "",
    lien_github: user?.profil?.lien_github || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await axios.put("/profile", formData);
      setMsg({ text: "Profil mis à jour avec succès !", type: "success" });
      // Update global context
      setUser({
        ...user,
        profil: {
          ...user.profil,
          ...formData,
        },
      });
    } catch (err) {
      setMsg({
        text: err.response?.data?.message || "Erreur lors de la mise à jour du profil.",
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.profil?.nom_complet || "E").substring(0, 2).toUpperCase();

  return (
    <div className="sd-root">
      {/* Header */}
      <div className="sd-header">
        <div>
          <h1 className="sd-header__title">Mon Profil</h1>
          <p className="sd-header__sub">Gérez vos informations personnelles et vos réseaux sociaux</p>
        </div>
      </div>

      <div className="md-row md-row--wide">
        {/* Left: Edit Form Card */}
        <div className="sd-card">
          <h2
            style={{
              fontFamily: "Syne",
              fontSize: "18px",
              color: "var(--primary)",
              marginBottom: "20px",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "10px",
            }}
          >
            Modifier mes informations
          </h2>

          {msg.text && (
            <div
              style={{
                background: msg.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: msg.type === "success" ? "var(--success)" : "var(--danger)",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Nom complet */}
            <div className="sd-form-group">
              <label className="sd-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} color="var(--text-muted)" />
                <span>Nom complet</span>
              </label>
              <input
                type="text"
                name="nom_complet"
                className="sd-input"
                required
                value={formData.nom_complet}
                onChange={handleInputChange}
              />
            </div>

            {/* Bio */}
            <div className="sd-form-group">
              <label className="sd-label">Biographie / Description</label>
              <textarea
                name="bio"
                className="sd-textarea"
                placeholder="Parlez-nous un peu de vous, vos compétences ou vos passions..."
                value={formData.bio}
                onChange={handleInputChange}
              />
            </div>

            {/* LinkedIn */}
            <div className="sd-form-group">
              <label className="sd-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Linkedin size={14} color="#0077b5" />
                <span>Lien LinkedIn</span>
              </label>
              <input
                type="url"
                name="lien_linkedin"
                className="sd-input"
                placeholder="https://linkedin.com/in/username"
                value={formData.lien_linkedin}
                onChange={handleInputChange}
              />
            </div>

            {/* GitHub */}
            <div className="sd-form-group">
              <label className="sd-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Github size={14} color="var(--text-dark)" />
                <span>Lien GitHub</span>
              </label>
              <input
                type="url"
                name="lien_github"
                className="sd-input"
                placeholder="https://github.com/username"
                value={formData.lien_github}
                onChange={handleInputChange}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="sd-btn sd-btn--primary"
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                alignSelf: "flex-end",
                marginTop: "10px",
                padding: "10px 24px",
              }}
            >
              <Save size={15} />
              <span>{saving ? "Enregistrement..." : "Enregistrer"}</span>
            </button>
          </form>
        </div>

        {/* Right: Overview Stats Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Main User Card */}
          <div className="sd-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "30px 20px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: "bold",
                marginBottom: "16px",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {initials}
            </div>

            <h3 style={{ fontFamily: "Syne", fontSize: "20px", fontWeight: "700", color: "var(--text-dark)" }}>
              {formData.nom_complet || "Étudiant"}
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
              Rôle : Étudiant Hub
            </span>

            {formData.bio && (
              <p style={{ fontSize: "13px", color: "var(--text-body)", margin: "16px 0", lineHeight: "1.5" }}>
                "{formData.bio}"
              </p>
            )}

            {/* Social profiles icon links */}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              {formData.lien_github && (
                <a
                  href={formData.lien_github}
                  target="_blank"
                  rel="noreferrer"
                  className="sl-topbar__icon-btn"
                  title="GitHub Profile"
                >
                  <Github size={16} />
                </a>
              )}
              {formData.lien_linkedin && (
                <a
                  href={formData.lien_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="sl-topbar__icon-btn"
                  title="LinkedIn Profile"
                >
                  <Linkedin size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="sd-card">
            <h3
              style={{
                fontFamily: "Syne",
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--text-dark)",
                marginBottom: "16px",
              }}
            >
              Statistiques d'Activité
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Score */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <Award size={16} color="var(--accent)" />
                  <span>Score Mensuel</span>
                </span>
                <span style={{ fontWeight: "700", color: "var(--accent)", fontSize: "15px" }}>
                  {user?.profil?.score_mensuel || 0} pts
                </span>
              </div>

              {/* Inscription date */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <Calendar size={16} color="var(--primary)" />
                  <span>Membre depuis</span>
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-body)" }}>
                  {user?.user?.date_inscription
                    ? new Date(user.user.date_inscription).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                      })
                    : "Juin 2026"}
                </span>
              </div>

              {/* Email */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <Mail size={16} color="var(--text-muted)" />
                  <span>Adresse e-mail</span>
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-body)", wordBreak: "break-all" }}>
                  {user?.user?.email || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

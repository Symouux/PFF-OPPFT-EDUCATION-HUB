import React, { useState, useEffect } from "react";
import { BookOpen, ExternalLink, Calendar, User, Eye, X, Plus } from "lucide-react";
import { getResources, fetchDrivePreview, createResource } from "../../api/studentApi";
import "./Student.css";

export default function StudentResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preview overlay
  const [previewResource, setPreviewResource] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    url_fichier: "",
    type: "drive",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formPreviewUrl, setFormPreviewUrl] = useState("");
  const [formPreviewLoading, setFormPreviewLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = () => {
    setLoading(true);
    getResources()
      .then((res) => {
        setResources(res.data || []);
      })
      .catch((err) => setError(err.message || "Erreur de chargement"))
      .finally(() => setLoading(false));
  };

  const handleOpenPreview = async (resource) => {
    setPreviewResource(resource);
    setPreviewLoading(true);
    setPreviewUrl("");

    try {
      const parsed = await fetchDrivePreview(resource.url_fichier);
      setPreviewUrl(parsed.embed_url);
    } catch (err) {
      console.warn("Could not load preview. Fallback to view URL", err);
      // Fallback: search for file pattern
      let embedFallback = resource.url_fichier;
      if (resource.url_fichier.includes("/file/d/")) {
        const parts = resource.url_fichier.split("/file/d/");
        if (parts[1]) {
          const fileId = parts[1].split("/")[0];
          embedFallback = `https://drive.google.com/file/d/${fileId}/preview`;
        }
      }
      setPreviewUrl(embedFallback);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewResource(null);
    setPreviewUrl("");
  };

  const handleOpenCreate = () => {
    setFormData({
      titre: "",
      url_fichier: "",
      type: "drive",
    });
    setFormError("");
    setFormPreviewUrl("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratePreview = async () => {
    setFormError("");
    setFormPreviewUrl("");
    const url = formData.url_fichier.trim();
    if (!url) {
      setFormError("Veuillez saisir une URL.");
      return;
    }
    if (!url.includes("drive.google.com") && !url.includes("docs.google.com")) {
      setFormError("L'URL doit être un lien Google Drive ou Google Docs.");
      return;
    }
    setFormPreviewLoading(true);
    try {
      const parsed = await fetchDrivePreview(url);
      setFormPreviewUrl(parsed.embed_url);
    } catch (err) {
      console.warn("Could not fetch preview", err);
      // Fallback preview URL generation logic
      let embedFallback = url;
      if (url.includes("/file/d/")) {
        const parts = url.split("/file/d/");
        if (parts[1]) {
          const fileId = parts[1].split("/")[0];
          embedFallback = `https://drive.google.com/file/d/${fileId}/preview`;
        }
      }
      setFormPreviewUrl(embedFallback);
    } finally {
      setFormPreviewLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const url = formData.url_fichier.trim();
    if (!url) {
      setFormError("Le lien de la ressource est requis.");
      setSaving(false);
      return;
    }

    if (!url.includes("drive.google.com") && !url.includes("docs.google.com")) {
      setFormError("L'URL doit être un lien Google Drive ou Google Docs.");
      setSaving(false);
      return;
    }

    try {
      await createResource({
        titre: formData.titre.trim(),
        url_fichier: url,
        type: formData.type,
      });
      handleCloseModal();
      fetchResources();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <span className="sd-spinner" />
        Chargement des ressources...
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
          <h1 className="sd-header__title">Ressources Partagées</h1>
          <p className="sd-header__sub">
            Accédez aux supports de cours, PDF, et documentations ou partagez-en pour la communauté
          </p>
        </div>
        <button className="sd-btn sd-btn--primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>Partager une Ressource</span>
        </button>
      </div>

      {resources.length === 0 ? (
        <div
          className="sd-card"
          style={{
            textAlign: "center",
            padding: "60px 40px",
            color: "var(--text-muted)",
          }}
        >
          <BookOpen size={40} color="var(--text-muted)" />
          <p style={{ marginTop: "14px", fontSize: "14px" }}>
            Aucune ressource de cours n'a été partagée pour le moment.
          </p>
        </div>
      ) : (
        <div className="sd-feed-grid">
          {resources.map((res, i) => (
            <div
              className="sd-card"
              key={res.id}
              style={{
                animationDelay: `${i * 0.05}s`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(13, 148, 136, 0.1)",
                    color: "var(--accent)",
                    marginBottom: "12px",
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <h3
                  style={{
                    fontFamily: "Syne",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "var(--text-dark)",
                    marginBottom: "10px",
                  }}
                >
                  {res.titre}
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <User size={13} />
                    <span>Partagé par : {res.user?.profil?.nom_complet || "Mentor"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={13} />
                    <span>Le : {new Date(res.date_ajout || new Date()).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "12px",
                  marginTop: "auto",
                }}
              >
                <button
                  className="sd-btn sd-btn--primary"
                  onClick={() => handleOpenPreview(res)}
                  style={{ flex: 1, justifyContent: "center", fontSize: "12px" }}
                >
                  <Eye size={13} />
                  <span>Consulter</span>
                </button>
                <a
                  href={res.url_fichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sd-btn"
                  style={{ justifyContent: "center", width: "40px", padding: "0" }}
                  title="Ouvrir dans Google Drive"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Resource Modal */}
      {modalOpen && (
        <div className="sd-modal-overlay" onClick={handleCloseModal}>
          <form
            className="sd-modal sd-modal--wide"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSave}
          >
            <div className="sd-modal__head">
              <h3 className="sd-modal__title">Partager une Ressource</h3>
              <button
                type="button"
                className="sd-modal__close"
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="sd-modal__body">
              {formError && (
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
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="sd-form-group">
                <label className="sd-label">Titre de la ressource</label>
                <input
                  type="text"
                  name="titre"
                  className="sd-input"
                  placeholder="Ex: Support de cours - Algorithmique et structures de données"
                  required
                  value={formData.titre}
                  onChange={handleInputChange}
                />
              </div>

              {/* Type */}
              <div className="sd-form-group">
                <label className="sd-label">Type de Ressource</label>
                <select
                  name="type"
                  className="sd-select"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="drive">Google Drive Document / PDF</option>
                  <option value="slides">Slides / Présentation</option>
                  <option value="sheet">Feuille de calcul (Sheet)</option>
                  <option value="other">Autre format</option>
                </select>
              </div>

              {/* URL */}
              <div className="sd-form-group">
                <label className="sd-label">Lien Google Drive / Docs du Document</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="url"
                    name="url_fichier"
                    className="sd-input"
                    placeholder="https://drive.google.com/file/d/..."
                    required
                    value={formData.url_fichier}
                    onChange={handleInputChange}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="sd-btn sd-btn--primary"
                    onClick={handleGeneratePreview}
                    disabled={formPreviewLoading}
                  >
                    {formPreviewLoading ? "Chargement..." : "Vérifier l'aperçu"}
                  </button>
                </div>
              </div>

              {/* Live Preview Panel */}
              {formPreviewUrl && (
                <div style={{ marginTop: "16px" }}>
                  <label className="sd-label" style={{ marginBottom: "8px" }}>Aperçu du document</label>
                  <iframe
                    src={formPreviewUrl}
                    className="preview-frame"
                    allow="autoplay"
                    style={{ height: "300px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}
                    title="Creation Preview"
                  />
                </div>
              )}
            </div>

            <div className="sd-modal__foot">
              <button
                type="button"
                className="sd-btn"
                onClick={handleCloseModal}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="sd-btn sd-btn--primary"
                disabled={saving}
              >
                {saving ? "Partage..." : "Partager"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Embedded Document Preview Modal */}
      {previewResource && (
        <div className="sd-modal-overlay" onClick={handleClosePreview}>
          <div
            className="sd-modal sd-modal--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sd-modal__head">
              <h3 className="sd-modal__title">{previewResource.titre}</h3>
              <button className="sd-modal__close" onClick={handleClosePreview}>
                <X size={20} />
              </button>
            </div>

            <div className="sd-modal__body" style={{ padding: "16px" }}>
              {previewLoading ? (
                <div style={{ textAlign: "center", padding: "80px 40px" }}>
                  <span className="sd-spinner" />
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "12px" }}>
                    Connexion sécurisée à Google Drive...
                  </p>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="preview-frame"
                  allow="autoplay"
                  style={{ height: "550px" }}
                  title="Document Preview"
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--danger)" }}>
                  Échec du chargement de l'aperçu.
                </div>
              )}
            </div>

            <div className="sd-modal__foot">
              <a
                href={previewResource.url_fichier}
                target="_blank"
                rel="noopener noreferrer"
                className="sd-btn sd-btn--primary"
                style={{ display: "flex", gap: "6px", alignItems: "center" }}
              >
                <ExternalLink size={14} />
                <span>Ouvrir dans Drive</span>
              </a>
              <button className="sd-btn" onClick={handleClosePreview}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

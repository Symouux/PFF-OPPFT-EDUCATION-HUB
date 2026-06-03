import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ExternalLink, Globe } from "lucide-react";
import {
  getProjects,
  getCategories,
  createProject,
  updateProject,
  deleteProject,
} from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";
import "./Student.css";

export default function StudentProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    technologies: "",
    lienGithub: "",
    category_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getProjects(), getCategories()])
      .then(([projRes, catRes]) => {
        // filter projects owned by the logged in student
        const allProj = projRes.data || [];
        const studentId = user?.user?.id;
        const ownProj = allProj.filter((p) => p.utilisateur_id === studentId);
        setProjects(ownProj);
        setCategories(catRes.data || []);
      })
      .catch((err) => setError(err.message || "Erreur de chargement"))
      .finally(() => setLoading(false));
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      titre: "",
      description: "",
      technologies: "",
      lienGithub: "",
      category_id: categories[0]?.id || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      titre: project.titre,
      description: project.description,
      technologies: project.technologies || "",
      lienGithub: project.lienGithub || "",
      category_id: project.category_id,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    // Validate GitHub/Drive links
    const isGithub = formData.lienGithub.includes("github.com");
    const isDrive =
      formData.lienGithub.includes("drive.google.com") ||
      formData.lienGithub.includes("docs.google.com");

    if (!isGithub && !isDrive) {
      setFormError("L'URL de dépôt doit être un lien GitHub ou Google Drive.");
      setSaving(false);
      return;
    }

    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
      } else {
        await createProject(formData);
      }
      handleCloseModal();
      fetchData(); // Reload list
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce projet ?")) {
      return;
    }
    try {
      await deleteProject(projectId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <span className="sd-spinner" />
        Chargement de vos projets...
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
          <h1 className="sd-header__title">Mes Projets Dépôt</h1>
          <p className="sd-header__sub">Gérez, éditez ou publiez de nouveaux projets académiques</p>
        </div>
        <button className="sd-btn sd-btn--primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>Nouveau Projet</span>
        </button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div
          className="sd-card"
          style={{
            textAlign: "center",
            padding: "60px 40px",
            color: "var(--text-muted)",
          }}
        >
          <FolderOpenIcon />
          <p style={{ marginTop: "14px", fontSize: "14px" }}>
            Vous n'avez pas encore publié de projet. Cliquez sur "Nouveau Projet" pour commencer !
          </p>
        </div>
      ) : (
        <div className="sd-feed-grid">
          {projects.map((project, i) => (
            <div
              className="sd-card project-card"
              key={project.id}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div>
                <div className="project-card__header">
                  <span className="project-card__category">
                    {categories.find((c) => String(c.id) === String(project.category_id))?.name ||
                      "Général"}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleOpenEdit(project)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        cursor: "pointer",
                      }}
                      title="Modifier"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--danger)",
                        cursor: "pointer",
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="project-card__title">{project.titre}</h3>
                <p className="project-card__desc">{project.description}</p>

                {project.technologies && (
                  <div className="project-card__techs">
                    {project.technologies.split(",").map((tech) => (
                      <span className="tech-tag" key={tech}>
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="project-card__footer" style={{ borderTopColor: "var(--border)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Votes : <strong>{project.nb_votes}</strong> · Score :{" "}
                  <strong>{project.global_score || 0}</strong>
                </span>

                {project.lienGithub && (
                  <a
                    href={project.lienGithub}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: "var(--accent)",
                      textDecoration: "none",
                      fontWeight: "600",
                    }}
                  >
                    <span>Dépôt</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="sd-modal-overlay" onClick={handleCloseModal}>
          <form
            className="sd-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSave}
          >
            <div className="sd-modal__head">
              <h3 className="sd-modal__title">
                {editingProject ? "Modifier le Projet" : "Créer un Nouveau Projet"}
              </h3>
              <button
                type="button"
                className="sd-modal__close"
                onClick={handleCloseModal}
              >
                <XIcon />
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
                <label className="sd-label">Titre du Projet</label>
                <input
                  type="text"
                  name="titre"
                  className="sd-input"
                  placeholder="Ex: Application de gestion de bibliothèque"
                  required
                  value={formData.titre}
                  onChange={handleInputChange}
                />
              </div>

              {/* Category */}
              <div className="sd-form-group">
                <label className="sd-label">Catégorie / Thème</label>
                <select
                  name="category_id"
                  className="sd-select"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="sd-form-group">
                <label className="sd-label">Description Détaillée</label>
                <textarea
                  name="description"
                  className="sd-textarea"
                  placeholder="Expliquez brièvement le but du projet, ses fonctionnalités et comment le tester..."
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* Technologies */}
              <div className="sd-form-group">
                <label className="sd-label">Technologies (séparées par des virgules)</label>
                <input
                  type="text"
                  name="technologies"
                  className="sd-input"
                  placeholder="Ex: Laravel, React, MySQL, Docker"
                  required
                  value={formData.technologies}
                  onChange={handleInputChange}
                />
              </div>

              {/* Link Dépôt */}
              <div className="sd-form-group">
                <label className="sd-label">Lien de Dépôt (GitHub ou Google Drive)</label>
                <input
                  type="url"
                  name="lienGithub"
                  className="sd-input"
                  placeholder="Ex: https://github.com/mon-username/mon-projet"
                  required
                  value={formData.lienGithub}
                  onChange={handleInputChange}
                />
              </div>
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
                {saving ? "Sauvegarde..." : "Publier"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Icons
function FolderOpenIcon() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "var(--accent-glow)",
        color: "var(--accent)",
      }}
    >
      <Globe size={28} />
    </div>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

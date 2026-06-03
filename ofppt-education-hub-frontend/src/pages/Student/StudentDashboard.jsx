import React, { useState, useEffect } from "react";
import {
  Heart,
  Github,
  ExternalLink,
  BookOpen,
  FolderOpen,
  FileText,
  Search,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  getProjects,
  getCategories,
  voteProject,
  fetchGithubPreview,
  fetchDrivePreview,
} from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";
import "./Student.css";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Voting state tracker
  const [votedList, setVotedList] = useState(() => {
    const saved = localStorage.getItem(`voted_by_${user?.user?.id || "guest"}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Project details modal
  const [detailProject, setDetailProject] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    Promise.all([getProjects(), getCategories()])
      .then(([projRes, catRes]) => {
        setProjects(projRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch((err) => setError(err.message || "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (e, projectId) => {
    e.stopPropagation();
    try {
      await voteProject(projectId);
      // Success: update count and mark as voted
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, nb_votes: p.nb_votes + 1 } : p)),
      );
      const updatedVotes = [...votedList, projectId];
      setVotedList(updatedVotes);
      localStorage.setItem(
        `voted_by_${user?.user?.id || "guest"}`,
        JSON.stringify(updatedVotes),
      );
    } catch (err) {
      if (err.response?.status === 409) {
        // Already voted, mark it locally
        if (!votedList.includes(projectId)) {
          const updatedVotes = [...votedList, projectId];
          setVotedList(updatedVotes);
          localStorage.setItem(
            `voted_by_${user?.user?.id || "guest"}`,
            JSON.stringify(updatedVotes),
          );
        }
        alert("Vous avez déjà voté pour ce projet !");
      } else {
        alert(err.response?.data?.message || "Erreur lors du vote");
      }
    }
  };

  const handleOpenDetail = async (project) => {
    setDetailProject(project);
    setDetailLoading(true);
    setPreviewData(null);

    try {
      // Try resolving preview details
      if (project.lienGithub && project.lienGithub.includes("github.com")) {
        const ghPreview = await fetchGithubPreview(project.lienGithub);
        setPreviewData({ type: "github", data: ghPreview });
      } else if (
        project.lienGithub &&
        (project.lienGithub.includes("drive.google.com") ||
          project.lienGithub.includes("docs.google.com"))
      ) {
        const drivePreview = await fetchDrivePreview(project.lienGithub);
        setPreviewData({ type: "drive", data: drivePreview });
      }
    } catch (err) {
      console.warn("Could not load repository preview:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailProject(null);
    setPreviewData(null);
  };

  // Filter logic
  const filteredProjects = projects.filter((p) => {
    const matchesCat =
      selectedCategory === "all" || String(p.category_id) === String(selectedCategory);
    const matchesSearch =
      p.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getWinner = () => {
    if (projects.length === 0) return null;
    return [...projects].sort((a, b) => b.nb_votes - a.nb_votes)[0];
  };

  const winner = getWinner();

  if (loading) {
    return (
      <div className="sd-loading">
        <span className="sd-spinner" />
        Chargement des projets...
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
      {/* Top Banner (Trophy Project) */}
      {winner && (
        <div className="md-milestone" style={{ animationDelay: "0.1s" }}>
          <div>
            <p className="md-milestone__eyebrow">👑 Projet Vedette</p>
            <h3 className="md-milestone__title">{winner.titre}</h3>
            <p className="md-milestone__sub">
              Créé par {winner.user?.profil?.nom_complet || "Étudiant"} ·{" "}
              {winner.nb_votes} votes cette saison
            </p>
          </div>
          <div className="md-milestone__progress">
            <button className="sd-btn sd-btn--accent" onClick={() => handleOpenDetail(winner)}>
              Voir les Détails
            </button>
          </div>
        </div>
      )}

      {/* Control bar */}
      <div className="sd-header">
        <div>
          <h1 className="sd-header__title">Projets des Étudiants</h1>
          <p className="sd-header__sub">
            Découvrez et votez pour les meilleures créations de l'OFPPT
          </p>
        </div>
        <div className="sd-btn sd-btn--primary" style={{ display: "none" }}>
          Filtres
        </div>
      </div>

      {/* Categories & Search Panel */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          margin: "10px 0",
        }}
      >
        {/* Category Filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            className={`sd-btn ${selectedCategory === "all" ? "sd-btn--primary" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`sd-btn ${
                String(selectedCategory) === String(cat.id) ? "sd-btn--primary" : ""
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 16px",
            width: "300px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Rechercher par mot-clé..."
            style={{
              border: "none",
              outline: "none",
              fontSize: "13px",
              fontFamily: "Outfit",
              width: "100%",
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Feed */}
      {filteredProjects.length === 0 ? (
        <div
          className="sd-card"
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--text-muted)",
          }}
        >
          Aucun projet ne correspond aux critères de recherche.
        </div>
      ) : (
        <div className="sd-feed-grid">
          {filteredProjects.map((project, i) => {
            const hasVoted = votedList.includes(project.id);
            const isOwnProject = project.utilisateur_id === user?.user?.id;
            return (
              <div
                className="sd-card project-card"
                key={project.id}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => handleOpenDetail(project)}
              >
                <div>
                  <div className="project-card__header">
                    <span className="project-card__category">
                      {project.categories?.name || "Général"}
                    </span>
                    {project.lienGithub && <Github size={16} color="var(--text-muted)" />}
                  </div>

                  <h3 className="project-card__title">{project.titre}</h3>

                  <div className="project-card__author">
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "var(--accent-glow)",
                        color: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9px",
                        fontWeight: "bold",
                      }}
                    >
                      {(project.user?.profil?.nom_complet || "E")[0].toUpperCase()}
                    </div>
                    <span>Par {project.user?.profil?.nom_complet || "Étudiant Inconnu"}</span>
                  </div>

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

                <div className="project-card__footer">
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <TrendingUp size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Score Global: {project.global_score || 0}
                    </span>
                  </div>

                  <button
                    className={`vote-button ${hasVoted ? "vote-button--voted" : ""}`}
                    disabled={isOwnProject}
                    onClick={(e) => handleVote(e, project.id)}
                    title={isOwnProject ? "Vous ne pouvez pas voter pour votre propre projet" : ""}
                  >
                    <Heart size={14} fill={hasVoted ? "#fff" : "none"} />
                    <span>{project.nb_votes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Details Modal */}
      {detailProject && (
        <div className="sd-modal-overlay" onClick={handleCloseDetail}>
          <div
            className="sd-modal sd-modal--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sd-modal__head">
              <h3 className="sd-modal__title">{detailProject.titre}</h3>
              <button className="sd-modal__close" onClick={handleCloseDetail}>
                <X size={20} />
              </button>
            </div>

            <div className="sd-modal__body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 280px",
                  gap: "24px",
                  marginBottom: "20px",
                }}
              >
                {/* Left side details */}
                <div>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      marginBottom: "8px",
                      color: "var(--text-dark)",
                    }}
                  >
                    Description du projet
                  </h4>
                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: "1.6",
                      color: "var(--text-body)",
                      marginBottom: "16px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {detailProject.description}
                  </p>

                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      marginBottom: "8px",
                      color: "var(--text-dark)",
                    }}
                  >
                    Technologies utilisées
                  </h4>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                    {detailProject.technologies?.split(",").map((tech) => (
                      <span className="tech-tag" key={tech}>
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right side Metadata */}
                <div
                  style={{
                    background: "var(--bg-page)",
                    borderRadius: "var(--radius-sm)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Catégorie</span>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-dark)" }}>
                      {detailProject.categories?.name || "Général"}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Publié par</span>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-dark)" }}>
                      {detailProject.user?.profil?.nom_complet || "Étudiant"}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Date de dépôt</span>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-dark)" }}>
                      {new Date(detailProject.date_publication).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Statistiques</span>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-dark)" }}>
                      ❤️ {detailProject.nb_votes} votes · 📈 Score: {detailProject.global_score}
                    </p>
                  </div>
                  {detailProject.lienGithub && (
                    <a
                      href={detailProject.lienGithub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sd-btn sd-btn--primary"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        marginTop: "8px",
                        fontSize: "12px",
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>Ouvrir dans un onglet</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Dynamic Live Preview Panel */}
              {detailLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <span className="sd-spinner" />
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "10px" }}>
                    Chargement de l'aperçu dynamique du dépôt...
                  </p>
                </div>
              ) : previewData ? (
                <div>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      marginBottom: "10px",
                      color: "var(--text-dark)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FolderOpen size={16} color="var(--accent)" />
                    Aperçu interactif
                  </h4>

                  {/* GitHub tree representation */}
                  {previewData.type === "github" && (
                    <div className="preview-github-tree">
                      <div className="github-tree-header">
                        <Github size={16} />
                        <span>
                          Dépôt: {previewData.data.repository?.full_name || "github-repo"}
                        </span>
                      </div>
                      <div className="github-tree-body">
                        {/* Folders */}
                        {previewData.data.top_folders?.map((folder) => (
                          <div className="github-tree-item" key={folder.path}>
                            <FolderOpen size={15} color="#eab308" />
                            <span style={{ fontWeight: "600" }}>{folder.name}/</span>
                          </div>
                        ))}
                        {/* Files */}
                        {previewData.data.important_files?.map((file) => (
                          <div className="github-tree-item" key={file.path}>
                            <FileText size={15} color="var(--text-muted)" />
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Google Drive embedded preview */}
                  {previewData.type === "drive" && (
                    <iframe
                      src={previewData.data.embed_url}
                      className="preview-frame"
                      allow="autoplay"
                      title="Google Drive Document Preview"
                    />
                  )}
                </div>
              ) : (
                detailProject.lienGithub && (
                  <div
                    style={{
                      background: "var(--bg-page)",
                      padding: "16px",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "center",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    Dépôt externe : {detailProject.lienGithub}
                  </div>
                )
              )}
            </div>

            <div className="sd-modal__foot">
              <button className="sd-btn" onClick={handleCloseDetail}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

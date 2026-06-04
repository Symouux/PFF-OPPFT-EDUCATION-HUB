import React, { useState, useEffect } from "react";
import {
  Heart,
  ExternalLink,
  MessageCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  FileText,
  CalendarDays,
} from "lucide-react";
import { Github } from "../../components/Icons";
import {
  getProjects,
  getCategories,
  voteProject,
  fetchGithubPreview,
  fetchDrivePreview,
} from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";
import "./StudentDashboard.css";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPreview, setExpandedPreview] = useState(null);
  const [previewCache, setPreviewCache] = useState({});
  const [loadingPreview, setLoadingPreview] = useState(null);

  const [votedList, setVotedList] = useState(() => {
    const saved = localStorage.getItem(`voted_by_${user?.user?.id || "guest"}`);
    return saved ? JSON.parse(saved) : [];
  });

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
        if (!votedList.includes(projectId)) {
          const updatedVotes = [...votedList, projectId];
          setVotedList(updatedVotes);
          localStorage.setItem(
            `voted_by_${user?.user?.id || "guest"}`,
            JSON.stringify(updatedVotes),
          );
        }
      } else {
        alert(err.response?.data?.message || "Erreur lors du vote");
      }
    }
  };

  const togglePreview = async (project) => {
    if (expandedPreview === project.id) {
      setExpandedPreview(null);
      return;
    }
    setExpandedPreview(project.id);

    if (previewCache[project.id]) return;

    if (!project.lienGithub) return;

    setLoadingPreview(project.id);
    try {
      if (project.lienGithub.includes("github.com")) {
        const data = await fetchGithubPreview(project.lienGithub);
        setPreviewCache((prev) => ({ ...prev, [project.id]: { type: "github", data } }));
      } else if (
        project.lienGithub.includes("drive.google.com") ||
        project.lienGithub.includes("docs.google.com")
      ) {
        const data = await fetchDrivePreview(project.lienGithub);
        setPreviewCache((prev) => ({ ...prev, [project.id]: { type: "drive", data } }));
      }
    } catch (err) {
      console.warn("Preview load failed:", err);
    } finally {
      setLoadingPreview(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesCat =
      selectedCategory === "all" || String(p.category_id) === String(selectedCategory);
    const matchesSearch =
      p.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
    <div className="sh-root">
      <div className="sh-header">
        <div>
          <h1 className="sh-header__title">Fil d'actualité</h1>
          <p className="sh-header__sub">
            Découvrez les projets des étudiants de l'OFPPT
          </p>
        </div>
      </div>

      <div className="sh-filters">
        <div className="sh-filter-chips">
          <button
            className={`sh-chip ${selectedCategory === "all" ? "sh-chip--active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`sh-chip ${String(selectedCategory) === String(cat.id) ? "sh-chip--active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="sh-search">
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="sh-empty">
          <div className="sh-empty__icon">
            <FolderOpen size={40} />
          </div>
          <h3>Aucun projet trouvé</h3>
          <p>Essayez de modifier vos filtres ou votre recherche.</p>
        </div>
      ) : (
        <div className="sh-feed">
          {filteredProjects.map((project, i) => {
            const hasVoted = votedList.includes(project.id);
            const isOwnProject = project.utilisateur_id === user?.user?.id;
            const preview = previewCache[project.id];
            const isExpanded = expandedPreview === project.id;

            return (
              <article
                className="sh-post"
                key={project.id}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="sh-post__head">
                  <div className="sh-post__author">
                    <div className="sh-post__avatar">
                      {(project.user?.profil?.nom_complet || "E")[0].toUpperCase()}
                    </div>
                    <div className="sh-post__meta">
                      <strong>
                        {project.user?.profil?.nom_complet || "Étudiant"}
                      </strong>
                      <span>
                        <CalendarDays size={11} />
                        {timeAgo(project.date_publication)}
                        <span className="sh-post__cat">
                          {project.categories?.name || "Général"}
                        </span>
                      </span>
                    </div>
                  </div>
                  {project.lienGithub && <Github size={18} color="var(--text-muted)" />}
                </div>

                <h2 className="sh-post__title">{project.titre}</h2>
                <p className="sh-post__desc">{project.description}</p>

                {project.technologies && (
                  <div className="sh-post__techs">
                    {project.technologies.split(",").map((tech) => (
                      <span key={tech} className="sh-post__tag">{tech.trim()}</span>
                    ))}
                  </div>
                )}

                {project.lienGithub && (
                  <div className="sh-post__preview">
                    <button
                      className="sh-preview-toggle"
                      onClick={() => togglePreview(project)}
                    >
                      <Github size={15} />
                      <span>
                        {isExpanded ? "Masquer le dépôt" : "Afficher le dépôt"}
                      </span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {isExpanded && (
                      <div className="sh-preview-body">
                        {loadingPreview === project.id ? (
                          <div className="sh-preview-loading">
                            <span className="sd-spinner" />
                            Chargement du dépôt...
                          </div>
                        ) : preview?.type === "github" ? (
                          <div className="sh-github-tree">
                            <div className="sh-github-tree__head">
                              <Github size={14} />
                              <span>{preview.data.repository?.full_name}</span>
                            </div>
                            <div className="sh-github-tree__body">
                              {preview.data.top_folders?.map((folder) => (
                                <div className="sh-github-tree__item" key={folder.path}>
                                  <FolderOpen size={14} color="#eab308" />
                                  <span className="sh-github-tree__folder">{folder.name}/</span>
                                </div>
                              ))}
                              {preview.data.important_files?.map((file) => (
                                <a
                                  className="sh-github-tree__item"
                                  key={file.path}
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <FileText size={14} color="var(--text-muted)" />
                                  <span>{file.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : preview?.type === "drive" ? (
                          <iframe
                            src={preview.data.embed_url}
                            className="sh-preview-iframe"
                            allow="autoplay"
                            title="Drive Preview"
                          />
                        ) : null}
                      </div>
                    )}
                  </div>
                )}

                <div className="sh-post__actions">
                  <button
                    className={`sh-action-btn ${hasVoted ? "sh-action-btn--voted" : ""}`}
                    disabled={isOwnProject}
                    onClick={(e) => handleVote(e, project.id)}
                    title={isOwnProject ? "Vous ne pouvez pas voter pour votre projet" : ""}
                  >
                    <Heart
                      size={16}
                      fill={hasVoted ? "currentColor" : "none"}
                    />
                    <span>{project.nb_votes}</span>
                  </button>

                  <button className="sh-action-btn" disabled>
                    <MessageCircle size={16} />
                    <span>0</span>
                  </button>

                  <button className="sh-action-btn" disabled>
                    <Share2 size={16} />
                  </button>

                  {project.lienGithub && (
                    <a
                      href={project.lienGithub}
                      target="_blank"
                      rel="noreferrer"
                      className="sh-action-btn sh-action-btn--link"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}

                  <div className="sh-post__score">
                    Score: <strong>{project.global_score || 0}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Trophy, Medal, Heart, TrendingUp, Crown, RefreshCw } from "lucide-react";
import { getProjects } from "../../api/studentApi";
import "./Student.css";

export default function StudentLeaderboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    getProjects()
      .then((res) => {
        const sorted = (res.data || []).sort((a, b) => b.nb_votes - a.nb_votes);
        setProjects(sorted);
      })
      .catch((err) => setError(err.message || "Erreur de chargement"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const getRankStyle = (rank) => {
    if (rank === 1) return { bg: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", icon: <Crown size={18} /> };
    if (rank === 2) return { bg: "linear-gradient(135deg, #94a3b8, #64748b)", color: "#fff", icon: <Medal size={18} /> };
    if (rank === 3) return { bg: "linear-gradient(135deg, #b45309, #92400e)", color: "#fff", icon: <Medal size={18} /> };
    return { bg: "var(--bg-page)", color: "var(--text-muted)", icon: null };
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <span className="sd-spinner" />
        Chargement du classement...
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

  const top3 = projects.slice(0, 3);
  const rest = projects.slice(3);
  const maxVotes = projects[0]?.nb_votes || 1;

  return (
    <div className="sd-root">
      {/* Header */}
      <div className="sd-header">
        <div>
          <h1 className="sd-header__title">🏆 Classement des Projets</h1>
          <p className="sd-header__sub">
            {projects.length} projets classés par nombre de votes
          </p>
        </div>
        <button className="sd-btn" onClick={load}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Podium Top 3 */}
      {top3.length > 0 && (
        <div className="lb-podium">
          {/* 2nd place */}
          {top3[1] && (
            <div className="lb-podium__slot lb-podium__slot--2">
              <div className="lb-podium__avatar lb-podium__avatar--2">
                {(top3[1].user?.profil?.nom_complet || "E")[0].toUpperCase()}
              </div>
              <div className="lb-podium__rank lb-podium__rank--2">2</div>
              <p className="lb-podium__name">
                {top3[1].user?.profil?.nom_complet || "Étudiant"}
              </p>
              <p className="lb-podium__title">{top3[1].titre}</p>
              <div className="lb-podium__votes">
                <Heart size={13} fill="currentColor" /> {top3[1].nb_votes}
              </div>
              <div className="lb-podium__bar lb-podium__bar--2" />
            </div>
          )}

          {/* 1st place */}
          {top3[0] && (
            <div className="lb-podium__slot lb-podium__slot--1">
              <div className="lb-podium__crown">👑</div>
              <div className="lb-podium__avatar lb-podium__avatar--1">
                {(top3[0].user?.profil?.nom_complet || "E")[0].toUpperCase()}
              </div>
              <div className="lb-podium__rank lb-podium__rank--1">1</div>
              <p className="lb-podium__name">
                {top3[0].user?.profil?.nom_complet || "Étudiant"}
              </p>
              <p className="lb-podium__title">{top3[0].titre}</p>
              <div className="lb-podium__votes lb-podium__votes--gold">
                <Heart size={14} fill="currentColor" /> {top3[0].nb_votes}
              </div>
              <div className="lb-podium__bar lb-podium__bar--1" />
            </div>
          )}

          {/* 3rd place */}
          {top3[2] && (
            <div className="lb-podium__slot lb-podium__slot--3">
              <div className="lb-podium__avatar lb-podium__avatar--3">
                {(top3[2].user?.profil?.nom_complet || "E")[0].toUpperCase()}
              </div>
              <div className="lb-podium__rank lb-podium__rank--3">3</div>
              <p className="lb-podium__name">
                {top3[2].user?.profil?.nom_complet || "Étudiant"}
              </p>
              <p className="lb-podium__title">{top3[2].titre}</p>
              <div className="lb-podium__votes">
                <Heart size={13} fill="currentColor" /> {top3[2].nb_votes}
              </div>
              <div className="lb-podium__bar lb-podium__bar--3" />
            </div>
          )}
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="sd-card lb-table-card">
        <div className="lb-table-header">
          <Trophy size={16} color="var(--accent)" />
          <span>Classement complet</span>
        </div>

        {projects.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
            Aucun projet disponible.
          </p>
        ) : (
          <div className="lb-table">
            {projects.map((project, i) => {
              const rank = i + 1;
              const rankStyle = getRankStyle(rank);
              const barWidth = maxVotes > 0 ? (project.nb_votes / maxVotes) * 100 : 0;

              return (
                <div
                  key={project.id}
                  className={`lb-row${rank <= 3 ? " lb-row--top" : ""}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {/* Rank badge */}
                  <div
                    className="lb-row__rank"
                    style={{ background: rankStyle.bg, color: rankStyle.color }}
                  >
                    {rankStyle.icon || rank}
                  </div>

                  {/* Avatar */}
                  <div className="lb-row__avatar">
                    {(project.user?.profil?.nom_complet || "E")[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="lb-row__info">
                    <p className="lb-row__project">{project.titre}</p>
                    <p className="lb-row__student">
                      {project.user?.profil?.nom_complet || "Étudiant"} ·{" "}
                      <span className="lb-row__cat">
                        {project.categories?.name || "Général"}
                      </span>
                    </p>
                    {/* Vote bar */}
                    <div className="lb-row__bar-track">
                      <div
                        className="lb-row__bar-fill"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="lb-row__right">
                    <div className="lb-row__votes">
                      <Heart size={14} fill="var(--danger)" color="var(--danger)" />
                      <span>{project.nb_votes}</span>
                    </div>
                    {project.global_score != null && (
                      <div className="lb-row__score">
                        <TrendingUp size={12} />
                        <span>{project.global_score}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios'; 
import './MentorProfile.css';

export default function MentorProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const userRole = localStorage.getItem('role');

  useEffect(() => {
    // Fetch mentor profile data from the backend API
    axios.get('/mentor/profile') 
      .then(res => {
        setProfileData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="profile-loading-container">
        <div className="profile-spinner"></div>
      </div>
    );
  }

  if (!profileData) {
    return <div className="profile-error">Aucun profil trouvé.</div>;
  }

  const { nom_complet, bio, photo, lien_linkedin, lien_github, stats, reviews } = profileData;
  const skills = ["React", "Node.js", "Express", "MongoDB", "Laravel", "Tailwind CSS", "Figma"];

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        
        {/* Header Card: Personal Information */}
        <div className="profile-card-header">
          <div className="profile-avatar-wrapper">
            <img 
              className="profile-avatar-img"
              src={photo ? `http://localhost:8000/uploads/avatars/${photo}` : 'https://via.placeholder.com/150'} 
              alt={nom_complet}
            />
            <span className="profile-online-badge"></span>
          </div>
          
          <div className="profile-info-main">
            <h1 className="profile-name">{nom_complet}</h1>
            <p className="profile-title">Full-Stack Web Architect & UX Designer</p>
            <p className="profile-bio">{bio}</p>
            
            {/* Social Media Links */}
            <div className="profile-social-links">
              {lien_github && (
                <a href={lien_github} target="_blank" rel="noreferrer" className="profile-social-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.48.009-.175-.034-.68-.035-1.336-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.008.069-.008 1.003.07 1.53 1.03 1.53 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </a>
              )}
              {lien_linkedin && (
                <a href={lien_linkedin} target="_blank" rel="noreferrer" className="profile-social-icon profile-linkedin">
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              )}
            </div>
          </div>

          {userRole === 'etudiant' && (
            <div className="profile-action-area">
              <button className="profile-btn-contact" onClick={() => alert('Fonctionnalité de contact bientôt disponible')}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Contacter le Mentor
              </button>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-icon icon-blue">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            </div>
            <div>
              <p className="profile-stat-label">Projets Encadrés</p>
              <p className="profile-stat-number">{stats?.active_projects_count || 0}</p>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon icon-amber">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.367 1.25.565 1.833l-3.97 2.88a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.88a1 1 0 00-1.176 0l-3.97 2.88c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.88c-.793-.583-.387-1.833.565-1.833h4.907a1 1 0 00.95-.69l1.519-4.674z"/></svg>
            </div>
            <div>
              <p className="profile-stat-label">Evaluations Totales</p>
              <p className="profile-stat-number">{stats?.total_reviews_count || 0}</p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="profile-section-card">
          <h2 className="profile-section-title">
            <span className="profile-title-indicator"></span>
            Compétences & Tech Stack
          </h2>
          <div className="profile-skills-flex">
            {skills.map((skill, index) => (
              <span key={index} className="profile-skill-badge">{skill}</span>
            ))}
          </div>
        </div>

        {/* Reviews & Feedback Section */}
        <div className="profile-reviews-section">
          <h2 className="profile-section-title">
            <span className="profile-title-indicator"></span>
            Derniers Commentaires ({reviews?.length || 0})
          </h2>
          
          <div className="profile-reviews-list">
            {reviews && reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="profile-review-card">
                  <div className="profile-review-header">
                    <div>
                      <h4 className="profile-review-project">{review.project_title || 'Projet Étudiant'}</h4>
                      <p className="profile-review-date">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="profile-review-score">
                      ⭐ {review.final_score} / 25
                    </div>
                  </div>
                  <p className="profile-review-comment">"{review.comment}"</p>
                  
                  {/* Detailed Project Scores */}
                  <div className="profile-subscores-grid">
                    <div>💻 Code: <span className="subscore-val">{review.code_quality}/5</span></div>
                    <div>🎨 UI/UX: <span className="subscore-val">{review.ui_ux}/5</span></div>
                    <div>💡 Innov: <span className="subscore-val">{review.innovation}/5</span></div>
                    <div>⚡ Perf: <span className="subscore-val">{review.performance}/5</span></div>
                    <div>📢 Pres: <span className="subscore-val">{review.presentation}/5</span></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="profile-no-reviews">Aucune évaluation pour le moment.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

import {
  BookOpen,
  Users,
  MessageCircle,
  Laptop,
  Award,
  Shield,
} from "lucide-react";

export const FEATURES = [
  {
    icon: <BookOpen size={28} />,
    title: "Cours structurés",
    desc: "Accès à des contenus organisés et faciles à suivre.",
  },
  {
    icon: <Users size={28} />,
    title: "Communauté",
    desc: "Échange avec d'autres étudiants et mentors.",
  },
  {
    icon: <MessageCircle size={28} />,
    title: "Support",
    desc: "Pose tes questions et reçois des réponses rapides.",
  },
  {
    icon: <Laptop size={28} />,
    title: "Apprentissage en ligne",
    desc: "Apprends où tu veux, quand tu veux.",
  },
  {
    icon: <Award size={28} />,
    title: "Certificats",
    desc: "Valorise tes compétences avec des certificats.",
  },
  {
    icon: <Shield size={28} />,
    title: "Sécurité",
    desc: "Une plateforme fiable et sécurisée pour tous.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Créez votre compte",
    desc: "Inscrivez-vous en tant qu'étudiant ou mentor en quelques secondes.",
  },
  {
    num: "02",
    title: "Soumettez votre projet",
    desc: "Partagez votre projet avec la communauté et demandez un mentor.",
  },
  {
    num: "03",
    title: "Obtenez un mentor",
    desc: "Un expert accepte votre demande et examine votre travail.",
  },
  {
    num: "04",
    title: "Recevez votre évaluation",
    desc: "Score détaillé, commentaires constructifs et axes d'amélioration.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection observer for reveal animations
  useEffect(() => {
    const els = document.querySelectorAll(".hp-reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("hp-reveal--visible");
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="hp-root">
      {/* ── NAVBAR ── */}
      <nav className={`hp-nav${scrollY > 40 ? " hp-nav--scrolled" : ""}`}>
        <div className="hp-nav__inner">
          <div className="hp-nav__logo">
            <span className="hp-nav__logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M8 12l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            OFPPT_EDU <em>Hub</em>
          </div>
          <div className="hp-nav__links">
            <a href="#features">Fonctionnalités</a>
            <a href="#how">Comment ça marche</a>
          </div>
          <div className="hp-nav__actions">
            <button
              className="hp-btn hp-btn--ghost"
              onClick={() => navigate("/auth")}
            >
              Se connecter
            </button>
            <button
              className="hp-btn hp-btn--primary"
              onClick={() => navigate("/auth")}
            >
              Commencer →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hp-hero" ref={heroRef}>
        <div className="hp-hero__bg">
          <div className="hp-orb hp-orb--1" />
          <div className="hp-orb hp-orb--2" />
          <div className="hp-orb hp-orb--3" />
          <div className="hp-grid-pattern" />
        </div>

        <div className="hp-hero__content">
          <h1 className="hp-hero__title">
            Transformez vos projets
            <span className="hp-hero__title-accent"> en réussites</span>
            <br />
            avec un mentor expert
          </h1>
          <p className="hp-hero__sub">
            OFPPT_EDU Hub connecte les étudiants aux mentors expérimentés pour
            des évaluations structurées, un feedback constructif et un suivi
            personnalisé de vos projets.
          </p>
          <div className="hp-hero__cta">
            <button
              className="hp-btn hp-btn--hero"
              onClick={() => navigate("/auth")}
            >
              Rejoindre gratuitement
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              className="hp-btn hp-btn--outline"
              onClick={() => navigate("/auth")}
            >
              Je suis mentor
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="hp-features" id="features">
        <div className="hp-container">
          <div className="hp-section-head hp-reveal">
            <h2 className="hp-section-title">Tout ce dont vous avez besoin</h2>
            <p className="hp-section-sub">
              Une plateforme complète pensée pour les étudiants et les mentors
              de l'OFPPT.
            </p>
          </div>
          <div className="hp-features__grid">
            {FEATURES.map((f, i) => (
              <div
                className="hp-feature-card hp-reveal"
                key={i}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="hp-feature-card__icon">{f.icon}</div>
                <h3 className="hp-feature-card__title">{f.title}</h3>
                <p className="hp-feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="hp-how" id="how">
        <div className="hp-container">
          <div className="hp-section-head hp-reveal">
            <h2 className="hp-section-title">Comment ça marche ?</h2>
            <p className="hp-section-sub">
              De l'inscription à l'évaluation finale en 4 étapes simples.
            </p>
          </div>
          <div className="hp-steps">
            {STEPS.map((s, i) => (
              <div
                className="hp-step hp-reveal"
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="hp-step__num">{s.num}</div>
                <div className="hp-step__connector" />
                <div className="hp-step__body">
                  <h3 className="hp-step__title">{s.title}</h3>
                  <p className="hp-step__desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="hp-cta hp-reveal">
        <div className="hp-cta__orb" />
        <div className="hp-container">
          <div className="hp-cta__content">
            <h2 className="hp-cta__title">
              Prêt à faire passer vos projets au niveau supérieur ?
            </h2>
            <p className="hp-cta__sub">
              Rejoignez des milliers d'étudiants qui ont déjà amélioré leurs
              compétences grâce à OFPPT_EDU Hub.
            </p>
            <div className="hp-cta__btns">
              <button
                className="hp-btn hp-btn--white"
                onClick={() => navigate("/auth")}
              >
                Créer un compte étudiant
              </button>
              <button
                className="hp-btn hp-btn--outline-white"
                onClick={() => navigate("/auth")}
              >
                Devenir mentor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hp-footer">
        <div className="hp-container">
          <div className="hp-footer__top">
            <div className="hp-footer__brand">
              <div className="hp-nav__logo" style={{ marginBottom: 12 }}>
                <span className="hp-nav__logo-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M8 12l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                OFPPT_EDU <em>Hub</em>
              </div>
              <p className="hp-footer__tagline">
                La plateforme de mentorat officielle de l'OFPPT.
                <br />
                Connecter les talents de demain aux experts d'aujourd'hui.
              </p>
            </div>
            <div className="hp-footer__links">
              <div>
                <p className="hp-footer__col-title">Plateforme</p>
                <a href="#features">Fonctionnalités</a>
                <a href="#how">Comment ça marche</a>
              </div>
              <div>
                <p className="hp-footer__col-title">Compte</p>
                <a onClick={() => navigate("/auth")}>Se connecter</a>
                <a onClick={() => navigate("/auth")}>S'inscrire</a>
              </div>
            </div>
          </div>
          <div className="hp-footer__bottom">
            <p>© 2025 OFPPT_EDU Hub — OFPPT. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  FolderKanban,
  UserCheck,
  BookOpen,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Student.css";

const NAV_ITEMS = [
  { to: "/etudiant", label: "Dashboard", icon: LayoutDashboard },
  { to: "/etudiant/projects", label: "Mes Projets", icon: FolderKanban },
  { to: "/etudiant/mentors", label: "Mentors", icon: UserCheck },
  { to: "/etudiant/resources", label: "Ressources", icon: BookOpen },
  { to: "/etudiant/chat", label: "Messages", icon: MessageSquare },
  { to: "/etudiant/profile", label: "Mon Profil", icon: User },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const studentName = user?.profil?.nom_complet || user?.user?.email || "Étudiant";
  const initials = studentName.substring(0, 1).toUpperCase();

  const handleLogout = async () => {
    close();
    await logout();
    navigate("/auth");
  };

  return (
    <div className="sl-root">
      {/* Mobile overlay */}
      <div
        className={`sl-overlay${open ? " sl-overlay--on" : ""}`}
        onClick={close}
      />

      {/* SIDEBAR */}
      <aside className={`sl-sidebar${open ? " sl-sidebar--open" : ""}`}>
        {/* Logo */}
        <div className="sl-logo">
          <span className="sl-logo__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          <span className="sl-logo__text">
            Student<em>Hub</em>
          </span>
        </div>

        {/* Nav */}
        <nav className="sl-nav">
          <p className="sl-nav__label">Menu</p>
          {NAV_ITEMS.map(({ to, label, icon: NavIcon }) => {
            const active =
              location.pathname === to ||
              (to !== "/etudiant" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`sl-nav__item${active ? " sl-nav__item--active" : ""}`}
                onClick={close}
              >
                <span className="sl-nav__item-icon">
                  <NavIcon size={17} strokeWidth={1.8} />
                </span>
                <span>{label}</span>
                {active && (
                  <span className="sl-nav__item-arrow">
                    <ChevronRight size={13} />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sl-sidebar__footer">
          <button
            className="sl-publish-btn"
            onClick={() => {
              close();
              navigate("/etudiant/projects");
            }}
          >
            Nouveau Projet
          </button>
          <button className="sl-logout" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.8} />
            Déconnexion
          </button>
          <p className="sl-sidebar__version">v1.0.0 · OFPPTHub 2026</p>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="sl-main">
        {/* Top bar */}
        <header className="sl-topbar">
          <div className="sl-topbar__left">
            <button
              className="sl-hamburger"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="sl-topbar__breadcrumb">
              <span>Étudiant</span>
              <ChevronRight size={13} />
              <span className="sl-topbar__breadcrumb--active">
                {NAV_ITEMS.find(
                  (n) =>
                    n.to === location.pathname ||
                    (n.to !== "/etudiant" && location.pathname.startsWith(n.to)),
                )?.label ?? "Page"}
              </span>
            </div>
          </div>

          <div className="sl-topbar__right">
            <div className="sl-topbar__search">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher..."
                className="sl-search-input"
              />
            </div>

            <button className="sl-topbar__icon-btn" title="Notifications">
              <Bell size={18} strokeWidth={1.8} />
              <span className="sl-notif-dot" />
            </button>

            <div className="sl-topbar__divider" />

            <div
              className="sl-topbar__avatar"
              title="Profil"
              onClick={() => navigate("/etudiant/profile")}
            >
              {initials}
            </div>
            <div className="sl-topbar__user">
              <strong>{studentName}</strong>
              <span>Étudiant</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="sl-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

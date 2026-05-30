import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  FolderKanban,
  Star,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import './Mentor.css';

const NAV_ITEMS = [
  { to: '/mentor',                label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/mentor/notifications',  label: 'Notifications',  icon: Bell            },
  { to: '/mentor/projects',       label: 'Projets',        icon: FolderKanban    },
  { to: '/mentor/reviews',        label: 'Évaluations',    icon: Star            },
  { to: '/mentor/chat',           label: 'Messages',       icon: MessageCircle   },
  { to: '/mentor/profile',        label: 'Profil',         icon: User            },
];

const MentorLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="ml-root">

      {/* Mobile overlay */}
      <div
        className={`ml-overlay${open ? ' ml-overlay--on' : ''}`}
        onClick={close}
      />

      {/* SIDEBAR */}
      <aside className={`ml-sidebar${open ? ' ml-sidebar--open' : ''}`}>

        {/* Logo */}
        <div className="ml-logo">
          <span className="ml-logo__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                stroke="currentColor" strokeWidth="1.8"/>
              <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="ml-logo__text">Mentor<em>Hub</em></span>
        </div>

        {/* Nav */}
        <nav className="ml-nav">
          <p className="ml-nav__label">Navigation</p>
          {NAV_ITEMS.map(({ to, label, icon: NavIcon }) => {
            const active =
              location.pathname === to ||
              (to !== '/mentor' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`ml-nav__item${active ? ' ml-nav__item--active' : ''}`}
                onClick={close}
              >
                <span className="ml-nav__item-icon">
                  <NavIcon size={17} strokeWidth={1.8} />
                </span>
                <span>{label}</span>
                {active && (
                  <span className="ml-nav__item-arrow">
                    <ChevronRight size={13} />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="ml-sidebar__footer">
          <button className="ml-start-review" onClick={close}>
            <PlusCircle size={16} strokeWidth={1.8} />
            Start Review
          </button>
          <button
            className="ml-logout"
            onClick={() => { close(); navigate('/auth'); }}
          >
            <LogOut size={16} strokeWidth={1.8} />
            Déconnexion
          </button>
          <p className="ml-sidebar__version">v1.0.0 · MentorHub 2025</p>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-main">

        {/* Top bar */}
        <header className="ml-topbar">
          <div className="ml-topbar__left">
            <button
              className="ml-hamburger"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="ml-topbar__breadcrumb">
              <span>Mentor</span>
              <ChevronRight size={13} />
              <span className="ml-topbar__breadcrumb--active">
                {NAV_ITEMS.find(n =>
                  n.to === location.pathname ||
                  (n.to !== '/mentor' && location.pathname.startsWith(n.to))
                )?.label ?? 'Page'}
              </span>
            </div>
          </div>

          <div className="ml-topbar__right">
            <div className="ml-topbar__search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Rechercher mentors, projets..."
                className="ml-search-input"
              />
            </div>

            <button className="ml-topbar__icon-btn" title="Notifications">
              <Bell size={18} strokeWidth={1.8} />
              <span className="ml-notif-dot" />
            </button>
            <button className="ml-topbar__icon-btn" title="Messages">
              <MessageCircle size={18} strokeWidth={1.8} />
            </button>

            <div className="ml-topbar__divider" />

            <div className="ml-topbar__avatar" title="Mentor">
              M
            </div>
            <div className="ml-topbar__user">
              <strong>Mentor</strong>
              <span>Senior Mentor</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="ml-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MentorLayout;
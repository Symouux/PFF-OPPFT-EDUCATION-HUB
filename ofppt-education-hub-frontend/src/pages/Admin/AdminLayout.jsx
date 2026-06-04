import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import './Admin.css';

const NAV_ITEMS = [
  { to: '/admin',           label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/admin/users',     label: 'Utilisateurs', icon: Users           },
  { to: '/admin/projects',  label: 'Projets',      icon: FolderKanban    },
  // { to: '/admin/resources', label: 'Ressources',   icon: BookOpen        },
];

const AdminLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="al-root">

      {/* ── Mobile overlay ── */}
      <div
        className={`al-overlay${open ? ' al-overlay--on' : ''}`}
        onClick={close}
      />

      {/* ════════════════════════════
          SIDEBAR
      ════════════════════════════ */}
      <aside className={`al-sidebar${open ? ' al-sidebar--open' : ''}`}>

        {/* Logo */}
        <div className="al-logo">
          <span className="al-logo__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="al-logo__text">Admin<em>Hub</em></span>
        </div>

        {/* Nav */}
        <nav className="al-nav">
          <p className="al-nav__label">Navigation</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to ||
              (to !== '/admin' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`al-nav__item${active ? ' al-nav__item--active' : ''}`}
                onClick={close}
              >
                <span className="al-nav__item-icon">
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <span>{label}</span>
                {active && (
                  <span className="al-nav__item-arrow">
                    <ChevronRight size={13} />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="al-sidebar__footer">
          <button
            className="al-logout"
            onClick={() => { close(); navigate('/login'); }}
          >
            <LogOut size={16} strokeWidth={1.8} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ════════════════════════════
          MAIN
      ════════════════════════════ */}
      <div className="al-main">

        {/* Top bar */}
        <header className="al-topbar">
          <div className="al-topbar__left">
            <button
              className="al-hamburger"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="al-topbar__breadcrumb">
              <span>Admin</span>
              <ChevronRight size={13} />
              <span className="al-topbar__breadcrumb--active">
                {NAV_ITEMS.find(n =>
                  n.to === location.pathname ||
                  (n.to !== '/admin' && location.pathname.startsWith(n.to))
                )?.label ?? 'Page'}
              </span>
            </div>
          </div>

          <div className="al-topbar__right">
            <div className="al-topbar__avatar" title="Symouux Admin">
              SA
            </div>
            <div className="al-topbar__user">
              <strong>Symouux Admin</strong>
              <span>Administrateur</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="al-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
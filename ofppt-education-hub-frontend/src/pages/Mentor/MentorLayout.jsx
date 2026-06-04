import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";
import "./Mentor.css";

const NAV_ITEMS = [
  { to: "/mentor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mentor/notifications", label: "Notifications", icon: Bell },
  { to: "/mentor/projects", label: "Projets", icon: FolderKanban },
  { to: "/mentor/reviews", label: "Évaluations", icon: Star },
  { to: "/mentor/chat", label: "Messages", icon: MessageCircle },
  { to: "/mentor/profile", label: "Profil", icon: User },
];

const MentorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authData, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);

  const profil = authData?.profil;
  const nomComplet = profil?.nom_complet ?? "Mentor";
  const photo = profil?.photo ?? null;
  const initials = nomComplet
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const close = () => setOpen(false);

  // Fetch badge counts every 30s
  useEffect(() => {
    const fetchCounts = () => {
      axios
        .get("/mentor/requests")
        .then((res) => setNotifCount(res.data.unread_count ?? 0))
        .catch(() => {});

      axios
        .get("/messages/unread/count")
        .then((res) => setMsgCount(res.data.unread_count ?? 0))
        .catch(() => {});
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    close();
    await logout();
    navigate("/auth");
  };

  return (
    <div className="ml-root">
      <div
        className={`ml-overlay${open ? " ml-overlay--on" : ""}`}
        onClick={close}
      />

      {/* SIDEBAR */}
      <aside className={`ml-sidebar${open ? " ml-sidebar--open" : ""}`}>
        <div className="ml-logo">
          <span className="ml-logo__icon">
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
          <span className="ml-logo__text">
            Mentor<em>Hub</em>
          </span>
        </div>

        <nav className="ml-nav">
          <p className="ml-nav__label">Navigation</p>
          {NAV_ITEMS.map(({ to, label, icon: NavIcon }) => {
            const active =
              location.pathname === to ||
              (to !== "/mentor" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`ml-nav__item${active ? " ml-nav__item--active" : ""}`}
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

        <div className="ml-sidebar__footer">
          <button
            className="ml-start-review"
            onClick={() => {
              close();
              navigate("/mentor/projects");
            }}
          >
            <PlusCircle size={16} strokeWidth={1.8} /> Start Review
          </button>
          <button className="ml-logout" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.8} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-main">
        <header className="ml-topbar">
          <div className="ml-topbar__left">
            <button className="ml-hamburger" onClick={() => setOpen(!open)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="ml-topbar__breadcrumb">
              <span>Mentor</span>
              <ChevronRight size={13} />
              <span className="ml-topbar__breadcrumb--active">
                {NAV_ITEMS.find(
                  (n) =>
                    n.to === location.pathname ||
                    (n.to !== "/mentor" && location.pathname.startsWith(n.to)),
                )?.label ?? "Page"}
              </span>
            </div>
          </div>

          <div className="ml-topbar__right">
            {/* Notifications badge */}
            <button
              className="ml-topbar__icon-btn"
              title="Notifications"
              onClick={() => navigate("/mentor/notifications")}
            >
              <Bell size={18} strokeWidth={1.8} />
              {notifCount > 0 && (
                <span className="ml-badge">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>

            {/* Messages badge */}
            <button
              className="ml-topbar__icon-btn"
              title="Messages"
              onClick={() => navigate("/mentor/chat")}
            >
              <MessageCircle size={18} strokeWidth={1.8} />
              {msgCount > 0 && (
                <span className="ml-badge">
                  {msgCount > 9 ? "9+" : msgCount}
                </span>
              )}
            </button>

            <div className="ml-topbar__divider" />

            {/* Avatar + nom cliquable → profil */}
            <button
              className="ml-topbar__profile-btn"
              onClick={() => navigate("/mentor/profile")}
              title="Mon profil"
            >
              {photo ? (
                <img
                  src={`http://localhost:8000/uploads/avatars/${photo}`}
                  alt={nomComplet}
                  className="ml-topbar__avatar-img"
                />
              ) : (
                <div className="ml-topbar__avatar">{initials}</div>
              )}
              <div className="ml-topbar__user">
                <strong>{nomComplet}</strong>
                <span>Senior Mentor</span>
              </div>
            </button>
          </div>
        </header>

        <main className="ml-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MentorLayout;

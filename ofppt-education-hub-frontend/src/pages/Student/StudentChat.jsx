import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Edit,
  Phone,
  Video,
  Info,
  Send,
  Smile,
  Paperclip,
  Image,
  BellOff,
  UserSearch,
  MoreHorizontal,
  CheckCheck,
  Check,
  Plus,
  X,
  MessageCircle,
} from "lucide-react";
import axios from "../../api/axios";
import { getMentors, createConversation } from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";
import "../Mentor/MentorChat.css";

/* ── Helpers ── */
const getInitials = (nom_complet) => {
  if (!nom_complet) return "?";
  const parts = nom_complet.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatConvTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Date.now() - d;
  if (diff < 60000) return "maintenant";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
  if (diff < 86400000) return formatTime(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

const groupByDate = (messages) => {
  const groups = {};
  [...messages].reverse().forEach((msg) => {
    const day = new Date(msg.created_at).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!groups[day]) groups[day] = [];
    groups[day].push(msg);
  });
  return groups;
};

/* ── Avatar ── */
function Avatar({ profil, size = 40, online = false }) {
  const nom_complet = profil?.nom_complet ?? null;
  const photo = profil?.photo ?? null;
  return (
    <div
      className="mc-avatar"
      style={{ width: size, height: size, fontSize: size * 0.33 }}
    >
      {photo ? (
        <img src={photo} alt={nom_complet ?? "avatar"} />
      ) : (
        <span>{getInitials(nom_complet)}</span>
      )}
      {online && <span className="mc-avatar__dot" />}
    </div>
  );
}

export default function StudentChat() {
  const { user: authData } = useAuth();
  const meId = authData?.user?.id;
  const meProfil = authData?.profil;

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [showNewModal, setShowNewModal] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  /* ── Load conversations ── */
  useEffect(() => {
    axios
      .get("/conversations")
      .then((res) => setConversations(res.data))
      .catch(console.error)
      .finally(() => setLoadingConvs(false));
  }, []);

  /* ── Load messages when active conversation changes ── */
  useEffect(() => {
    if (!activeConv) return;
    loadMessages(activeConv.id);
    markAsRead(activeConv.id);

    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(activeConv.id), 5000);
    return () => clearInterval(pollRef.current);
  }, [activeConv?.id]);

  /* ── Scroll to bottom ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = (convId) => {
    setLoadingMsgs(true);
    axios
      .get(`/messages/${convId}`)
      .then((res) => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  };

  const markAsRead = (convId) => {
    axios.put(`/messages/read/${convId}`).catch(console.error);
  };

  /* ── Send message ── */
  const sendMessage = async () => {
    if (!text.trim() || !activeConv) return;
    const content = text.trim();
    setText("");

    // Optimistic update
    const optimistic = {
      id: `tmp-${Date.now()}`,
      conversation_id: activeConv.id,
      sender_id: meId,
      message: content,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: { profil: meProfil },
      _pending: true,
    };
    setMessages((prev) => [optimistic, ...prev]);

    try {
      await axios.post("/messages", {
        conversation_id: activeConv.id,
        message: content,
      });
      loadMessages(activeConv.id);
    } catch (err) {
      console.error(err);
    }
  };

  const openNewConversation = async () => {
    setShowNewModal(true);
    if (mentors.length === 0) {
      setLoadingMentors(true);
      try {
        const res = await getMentors();
        setMentors(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMentors(false);
      }
    }
  };

  const startConversation = async (mentor) => {
    try {
      const conv = await createConversation(mentor.id);
      setShowNewModal(false);
      setActiveConv(conv);
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conv.id);
        return exists ? prev : [conv, ...prev];
      });
    } catch (err) {
      console.error(err);
      alert("Impossible de démarrer la conversation. Veuillez réessayer.");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Get the OTHER user in a conversation ── */
  const getOther = (conv) => {
    if (!conv || !meId) return null;
    const one = conv.user_one;
    const two = conv.user_two;
    return one?.id === meId ? two : one;
  };

  /* ── Filter by search ── */
  const filtered = conversations.filter((conv) => {
    const other = getOther(conv);
    const name = (
      other?.profil?.nom_complet ??
      other?.email ??
      ""
    ).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const other = getOther(activeConv);
  const grouped = activeConv ? groupByDate(messages) : {};

  return (
    <div className="mc-root" style={{ height: "calc(100vh - 60px)" }}>
      {/* ══ LEFT: Conversation list ══ */}
      <aside className="mc-sidebar">
        <div className="mc-sidebar__head">
          <h2 className="mc-sidebar__title">Messages</h2>
          <button className="mc-icon-btn" title="Nouveau message" onClick={openNewConversation}>
            <Edit size={18} />
          </button>
        </div>

        <div className="mc-search">
          <Search size={15} className="mc-search__icon" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mc-search__input"
          />
        </div>

        <div className="mc-conv-list">
          {loadingConvs && (
            <div className="mc-list-loading">
              <span className="sd-spinner" />
            </div>
          )}
          {!loadingConvs && filtered.length === 0 && (
            <p className="mc-empty">Aucune conversation.</p>
          )}
          {filtered.map((conv) => {
            const o = getOther(conv);
            const isActive = activeConv?.id === conv.id;
            const lastMsg = conv.messages?.[conv.messages?.length - 1];
            return (
              <div
                key={conv.id}
                className={`mc-conv-item${isActive ? " mc-conv-item--active" : ""}`}
                onClick={() => setActiveConv(conv)}
              >
                <Avatar profil={o?.profil} size={44} online />
                <div className="mc-conv-item__body">
                  <div className="mc-conv-item__top">
                    <span className="mc-conv-item__name">
                      {o?.profil?.nom_complet ?? o?.email ?? "Utilisateur"}
                    </span>
                    <span className="mc-conv-item__time">
                      {formatConvTime(conv.updated_at)}
                    </span>
                  </div>
                  <span className="mc-conv-item__preview">
                    {lastMsg?.message ?? "Démarrer la conversation"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ══ CENTER: Messages ══ */}
      <main className="mc-main">
        {!activeConv ? (
          <div className="mc-empty-state">
            <div className="mc-empty-state__icon">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="12" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
              </svg>
            </div>
            <h3>Discuter avec un Mentor</h3>
            <p>
              Sélectionnez un fil de discussion pour échanger sur vos projets académiques.
            </p>
            <button className="mc-empty-btn" onClick={openNewConversation}>
              <Plus size={16} /> Nouvelle conversation
            </button>
          </div>
        ) : (
          <>
            <div className="mc-main__topbar">
              <div className="mc-main__topbar-left">
                <Avatar profil={other?.profil} size={38} online />
                <div>
                  <p className="mc-main__name">
                    {other?.profil?.nom_complet ?? other?.email ?? "Utilisateur"}
                  </p>
                  <p className="mc-main__status">
                    <span className="mc-dot" /> Mentor
                  </p>
                </div>
              </div>
              <div className="mc-main__topbar-right">
                <button className="mc-icon-btn" title="Appel vidéo"><Video size={18} /></button>
                <button className="mc-icon-btn" title="Appel audio"><Phone size={18} /></button>
                <button className="mc-icon-btn" title="Infos"><Info size={18} /></button>
              </div>
            </div>

            <div className="mc-messages">
              {loadingMsgs && messages.length === 0 && (
                <div className="mc-messages__loading">
                  <span className="sd-spinner" /> Chargement...
                </div>
              )}
              {Object.entries(grouped).map(([day, msgs]) => (
                <div key={day}>
                  <div className="mc-day-separator"><span>{day.toUpperCase()}</span></div>
                  {msgs.map((msg) => {
                    const isMine = msg.sender_id === meId;
                    return (
                      <div key={msg.id} className={`mc-msg${isMine ? " mc-msg--mine" : " mc-msg--other"}`}>
                        {!isMine && <Avatar profil={msg.sender?.profil ?? other?.profil} size={32} />}
                        <div className="mc-msg__content">
                          <div className="mc-msg__bubble">{msg.message}</div>
                          <div className="mc-msg__meta">
                            <span>{formatTime(msg.created_at)}</span>
                            {isMine && (msg.is_read ? <CheckCheck size={13} className="mc-read" /> : <Check size={13} className="mc-sent" />)}
                          </div>
                        </div>
                        {isMine && <Avatar profil={meProfil} size={32} />}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="mc-input-bar">
              <button className="mc-icon-btn"><Smile size={18} /></button>
              <button className="mc-icon-btn"><Paperclip size={18} /></button>
              <button className="mc-icon-btn"><Image size={18} /></button>
              <textarea className="mc-input" placeholder="Répondre..." value={text}
                onChange={(e) => setText(e.target.value)} onKeyDown={handleKey} rows={1} />
              <button className={`mc-send-btn${text.trim() ? " mc-send-btn--active" : ""}`}
                onClick={sendMessage} disabled={!text.trim()}>
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </main>

      {/* ══ RIGHT: Profile panel ══ */}
      {activeConv && other && (
        <aside className="mc-info">
          <div className="mc-info__profile">
            <Avatar profil={other?.profil} size={80} online />
            <h3 className="mc-info__name">
              {other?.profil?.nom_complet ?? other?.email ?? "Utilisateur"}
            </h3>
            <p className="mc-info__role">
              {other?.role === "mentor" ? "Mentor Hub" : "Étudiant"}
            </p>
            <div className="mc-info__actions">
              <button className="mc-icon-btn" title="Profil">
                <UserSearch size={16} />
              </button>
              <button className="mc-icon-btn" title="Muet">
                <BellOff size={16} />
              </button>
              <button className="mc-icon-btn" title="Plus">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          <div className="mc-info__section">
            <p className="mc-info__section-title">INFORMATIONS</p>
            <div className="mc-info__row">
              <span className="mc-info__label">Email</span>
              <span className="mc-info__value">{other?.email ?? "—"}</span>
            </div>
            {other?.profil?.bio && (
              <div className="mc-info__row">
                <span className="mc-info__label">Bio</span>
                <span className="mc-info__value">{other.profil.bio}</span>
              </div>
            )}
            {other?.profil?.lien_linkedin && (
              <div className="mc-info__row">
                <span className="mc-info__label">LinkedIn</span>
                <a
                  href={other.profil.lien_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="mc-info__link"
                >
                  Voir profil
                </a>
              </div>
            )}
            {other?.profil?.lien_github && (
              <div className="mc-info__row">
                <span className="mc-info__label">GitHub</span>
                <a
                  href={other.profil.lien_github}
                  target="_blank"
                  rel="noreferrer"
                  className="mc-info__link"
                >
                  Voir profil
                </a>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ══ New conversation modal ══ */}
      {showNewModal && (
        <div className="sd-modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="sd-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="sd-modal__head">
              <h3 className="sd-modal__title">Nouvelle conversation</h3>
              <button className="sd-modal__close" onClick={() => setShowNewModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="sd-modal__body" style={{ maxHeight: "400px", overflowY: "auto" }}>
              {loadingMentors ? (
                <div className="sd-loading" style={{ height: "120px" }}>
                  <span className="sd-spinner" /> Chargement des mentors...
                </div>
              ) : mentors.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
                  Aucun mentor disponible pour le moment.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {mentors.map((mentor) => (
                    <button
                      key={mentor.id}
                      className="mc-new-conv-item"
                      onClick={() => startConversation(mentor)}
                    >
                      <Avatar profil={mentor.profil} size={40} />
                      <div className="mc-new-conv-item__body">
                        <strong>{mentor.profil?.nom_complet || "Mentor"}</strong>
                        <span>{mentor.mentor_profile?.categories?.name || "Spécialiste"}</span>
                      </div>
                      <MessageCircle size={16} className="mc-new-conv-item__icon" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

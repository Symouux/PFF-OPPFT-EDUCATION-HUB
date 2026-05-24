import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import {
  Trash2,
  ShieldOff,
  UserCheck,
  Filter,
  Search,
  Loader2,
  Upload,
} from "lucide-react";
import "./UsersList.css";

const UsersPage = () => {
  // ================= STATE =================
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // ================= STATE IMPORT =================
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { importes, ignores, erreurs[] }
  const fileInputRef = React.useRef(null);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // call backend API to get users
      const response = await axios.get("/admin/users");

      console.log("Response Full:", response.data);

      // extract users from paginated response
      const actualUsers = response.data.data.data || [];

      // save users in state
      setUsers(actualUsers);
      setFilteredUsers(actualUsers);
    } catch (error) {
      console.error("Erreur Fetching:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // run once when page loads
  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= FILTER + SEARCH =================
  useEffect(() => {
    // make sure users is an array
    let result = Array.isArray(users) ? [...users] : [];

    // filter by role if not "all"
    if (roleFilter !== "all") {
      result = result.filter(
        (user) => user.role?.toLowerCase() === roleFilter.toLowerCase(),
      );
    }

    // search by name or email
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // update filtered list
    setFilteredUsers(result);
  }, [roleFilter, searchTerm, users]);

  // ================= DELETE USER =================
  const handleDelete = async (id) => {
    console.log("Deleting user ID:", id);

    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        // call delete API
        const response = await axios.delete(`/admin/users/${id}`);
        console.log("Delete response:", response.data);

        // refresh users list
        fetchUsers();
      } catch (error) {
        console.error("Delete error:", error.response);
        alert(
          "Erreur: " +
            (error.response?.data?.message || "Impossible de supprimer"),
        );
      }
    }
  };

  // ================= BLOCK / UNBLOCK USER =================
  const handleToggleBlock = async (id) => {
    try {
      // toggle block status
      await axios.put(`/admin/users/${id}/block`);

      // refresh list after update
      fetchUsers();
    } catch (error) {
      alert("Erreur lors de la modification");
    }
  };

  // ================= DOWNLOAD TEMPLATE =================
  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get("/admin/users/import/template", {
        responseType: "blob", // important pour telecharger un fichier
      });

      // creer un lien temporaire pour declencher le telechargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "exemple_import_users.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur template:", error);
      alert("Impossible de télécharger le fichier exemple");
    }
  };

  // ================= IMPORT USERS =================
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // reset l'input pour pouvoir reimporter le meme fichier
    e.target.value = null;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setImporting(true);
      setImportResult(null);

      const response = await axios.post("/admin/users/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Import response:", response.data);

      // sauvegarder le resultat pour l'afficher dans le modal
      setImportResult(response.data.data);

      // rafraichir la liste — meme pattern que fetchUsers apres delete/block
      fetchUsers();
    } catch (error) {
      console.error("Import error:", error.response);
      alert(
        "Erreur import: " +
          (error.response?.data?.message || "Impossible d'importer"),
      );
    } finally {
      setImporting(false);
    }
  };
  // ================= LOADING UI =================
  if (loading)
    return (
      <div className="loader-container">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );

  // ================= UI =================
  return (
    <>
      <div className="users-page">
        <header className="users-header">
          <h1 className="page-title">
            Gestion des <span>Utilisateurs</span>
          </h1>

          {/* TOOLBAR */}
          <div className="header-controls">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* INPUT FILE CACHE */}
            <input
              type="file"
              accept=".xlsx,.csv"
              ref={fileInputRef}
              onChange={handleImport}
              style={{ display: "none" }}
            />
            {/* IMPORT */}
            <div className="import-box">
              <Upload size={18} className="import-icon" />
              <select
                className="import-select"
                value=""
                onChange={(e) => {
                  if (e.target.value === "import") fileInputRef.current.click();
                  if (e.target.value === "template") handleDownloadTemplate();
                }}
              >
                <option value="" disabled>
                  Importer Liste
                </option>
                <option value="import">Importer un fichier</option>
                <option value="template">Télécharger un exemple</option>
              </select>
            </div>

            <div className="filter-box">
              <Filter size={18} />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="mentor">Mentor</option>
                <option value="etudiant">Étudiant</option>
              </select>
            </div>
          </div>
        </header>

        {/* TABLE */}
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name">{user.name || "N/A"}</td>

                    <td className="user-email">{user.email || "N/A"}</td>

                    <td>
                      <span className={`role-badge ${user.role || "default"}`}>
                        {user.role || "User"}
                      </span>
                    </td>

                    <td>
                      <div className="status-indicator">
                        <span
                          className={`dot ${
                            user.is_blocked ? "blocked" : "active"
                          }`}
                        ></span>

                        {user.is_blocked ? "Bloqué" : "Actif"}
                      </div>
                    </td>

                    <td className="action-buttons">
                      <button
                        onClick={() => handleToggleBlock(user.id)}
                        title="Statut"
                      >
                        {user.is_blocked ? (
                          <UserCheck size={20} className="icon-success" />
                        ) : (
                          <ShieldOff size={20} className="icon-warning" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={20} className="icon-danger" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-msg">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL RESULTAT IMPORT */}
      {importResult && (
        <div className="import-modal-overlay">
          <div className="import-modal">
            <h2 className="import-modal-title">Résultat de l'import</h2>

            {/* STATS */}
            <div className="import-stats">
              <div className="import-stat success">
                <span className="stat-number">{importResult.importes}</span>

                <span className="stat-label">Importés</span>
              </div>

              <div className="import-stat warning">
                <span className="stat-number">{importResult.ignores}</span>

                <span className="stat-label">Ignorés</span>
              </div>
            </div>

            {/* ERREURS */}
            {importResult.erreurs?.length > 0 && (
              <div className="import-errors">
                <p className="import-errors-title">
                  Détails des lignes ignorées :
                </p>

                <ul>
                  {importResult.erreurs.map((err, index) => (
                    <li key={index}>
                      <span className="err-email">{err.email}</span>

                      {" — "}
                      {err.raison}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CLOSE */}
            <button
              className="import-modal-close"
              onClick={() => setImportResult(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersPage;

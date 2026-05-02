import React, { useState, useEffect } from 'react';
import axios from "../../api/axios"; 
import { Trash2, ShieldOff, UserCheck, Filter, Search, Loader2 } from 'lucide-react';
import './UsersList.css';

const UsersPage = () => {

    // ================= STATE =================
    const [users, setUsers] = useState([]); 
    const [filteredUsers, setFilteredUsers] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [roleFilter, setRoleFilter] = useState('all'); 

    // ================= FETCH USERS =================
    const fetchUsers = async () => {
        try {
            setLoading(true);

            // call backend API to get users
            const response = await axios.get('/admin/users');
            
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
        if (roleFilter !== 'all') {
            result = result.filter(user =>
                user.role?.toLowerCase() === roleFilter.toLowerCase()
            );
        }

        // search by name or email
        if (searchTerm) {
            result = result.filter(user =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
                alert("Erreur: " + (error.response?.data?.message || "Impossible de supprimer"));
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

    // ================= LOADING UI =================
    if (loading) return (
        <div className="loader-container">
            <Loader2 className="animate-spin" size={40} />
        </div>
    );

    // ================= UI =================
    return (
        <div className="users-page">

            {/* HEADER */}
            <header className="users-header">
                <h1 className="page-title">
                    Gestion des <span>Utilisateurs</span>
                </h1>

                {/* SEARCH + FILTER */}
                <div className="header-controls">

                    {/* SEARCH INPUT */}
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* ROLE FILTER */}
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

                    {/* TABLE HEADER */}
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody>

                        {/* IF USERS EXIST */}
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <tr key={user.id}>

                                {/* USER NAME */}
                                <td className="user-name">
                                    {user.name || 'N/A'}
                                </td>

                                {/* EMAIL */}
                                <td className="user-email">
                                    {user.email || 'N/A'}
                                </td>

                                {/* ROLE */}
                                <td>
                                    <span className={`role-badge ${user.role || 'default'}`}>
                                        {user.role || 'User'}
                                    </span>
                                </td>

                                {/* STATUS */}
                                <td>
                                    <div className="status-indicator">
                                        <span className={`dot ${user.is_blocked ? 'blocked' : 'active'}`}></span>
                                        {user.is_blocked ? 'Bloqué' : 'Actif'}
                                    </div>
                                </td>

                                {/* ACTION BUTTONS */}
                                <td className="action-buttons">

                                    {/* BLOCK / UNBLOCK */}
                                    <button
                                        onClick={() => handleToggleBlock(user.id)}
                                        title="Statut"
                                    >
                                        {user.is_blocked
                                            ? <UserCheck size={20} className="icon-success" />
                                            : <ShieldOff size={20} className="icon-warning" />
                                        }
                                    </button>

                                    {/* DELETE */}
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={20} className="icon-danger" />
                                    </button>

                                </td>

                            </tr>
                        )) : (

                            // EMPTY STATE
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
    );
};

export default UsersPage;
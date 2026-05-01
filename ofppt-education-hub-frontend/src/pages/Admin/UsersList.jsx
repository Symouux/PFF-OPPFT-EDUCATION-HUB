import React, { useState, useEffect } from 'react';
import axios from "../../api/axios"; 
import { Trash2, ShieldOff, UserCheck, Filter, Search, Loader2 } from 'lucide-react';
import './UsersList.css';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/users');
            
            console.log("Response Full:", response.data);

            const actualUsers = response.data.data.data || [];
            
            setUsers(actualUsers);
            setFilteredUsers(actualUsers);
        } catch (error) {
            console.error("Erreur Fetching:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        let result = Array.isArray(users) ? [...users] : [];
        
        if (roleFilter !== 'all') {
            result = result.filter(user => user.role?.toLowerCase() === roleFilter.toLowerCase());
        }

        if (searchTerm) {
            result = result.filter(user => 
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredUsers(result);
    }, [roleFilter, searchTerm, users]);

    const handleDelete = async (id) => {
    console.log("Suppression de l'utilisateur ID:", id); 
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
        try {
            const response = await axios.delete(`/admin/users/${id}`); 
            console.log("Réponse suppression:", response.data);
            
            fetchUsers(); 
            alert("Utilisateur supprimé avec succès");
        } catch (error) {
            console.error("Erreur suppression:", error.response);
            alert("Erreur: " + (error.response?.data?.message || "Impossible de supprimer"));
        }
    }
};

    const handleToggleBlock = async (id) => {
        try {
            await axios.put(`/admin/users/${id}/block`);
            fetchUsers();
        } catch (error) {
            alert("Erreur lors de la modification");
        }
    };

    if (loading) return (
        <div className="loader-container">
            <Loader2 className="animate-spin" size={40} />
        </div>
    );

    return (
        <div className="users-page">
            <header className="users-header">
                <h1 className="page-title">Gestion des <span>Utilisateurs</span></h1>
                
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

                    <div className="filter-box">
                        <Filter size={18} />
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="all">Tous les rôles</option>
                            <option value="admin">Admin</option>
                            <option value="mentor">Mentor</option>
                            <option value="student">Étudiant</option> 
                        </select>
                    </div>
                </div>
            </header>

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
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="user-name">{user.name || 'N/A'}</td>
                                <td className="user-email">{user.email || 'N/A'}</td>
                                <td>
                                    <span className={`role-badge ${user.role || 'default'}`}>
                                        {user.role || 'User'}
                                    </span>
                                </td>
                                <td>
                                    <div className="status-indicator">
                                        <span className={`dot ${user.is_blocked ? 'blocked' : 'active'}`}></span>
                                        {user.is_blocked ? 'Bloqué' : 'Actif'}
                                    </div>
                                </td>
                                <td className="action-buttons">
                                    <button onClick={() => handleToggleBlock(user.id)} title="Statut">
                                        {user.is_blocked ? <UserCheck size={20} className="icon-success" /> : <ShieldOff size={20} className="icon-warning" />}
                                    </button>
                                    <button onClick={() => handleDelete(user.id)} title="Supprimer">
                                        <Trash2 size={20} className="icon-danger" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="empty-msg">Aucun utilisateur trouvé.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPage;
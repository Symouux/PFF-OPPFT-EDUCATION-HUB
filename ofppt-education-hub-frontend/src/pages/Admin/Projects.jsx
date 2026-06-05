import React, { useState, useEffect } from 'react';
import axios from "../../api/axios";
import { Trash2, Archive, Search, Loader2, Filter } from 'lucide-react';
import './ProjectsList.css';

const ProjectsPage = () => {

    // ================= STATE =================
    const [projects, setProjects] = useState([]); // all projects
    const [filteredProjects, setFilteredProjects] = useState([]); // filtered list
    const [loading, setLoading] = useState(true); // loading state
    const [searchTerm, setSearchTerm] = useState(''); // search input
    const [statusFilter, setStatusFilter] = useState('all'); // status filter

    // ================= FETCH PROJECTS =================
    const fetchProjects = async () => {
        try {
            setLoading(true);

            // call backend API
            const response = await axios.get('/admin/projects');

            console.log("Response data:", response.data);

            // handle Laravel pagination or normal array
            const actualData = response.data?.data?.data || response.data?.data || [];

            // set data
            setProjects(actualData);
            setFilteredProjects(actualData);

        } catch (error) {
            console.error("Error fetching projects:", error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    // run once on page load
    useEffect(() => {
        fetchProjects();
    }, []);

    // ================= FILTER + SEARCH =================
    useEffect(() => {

        // make sure it's array
        if (!Array.isArray(projects)) return;

        let result = [...projects];

        // filter by status
        if (statusFilter !== 'all') {
            result = result.filter(p =>
                (p.status || '').toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // search by title or student name
        // search by title or student name
        if (searchTerm) {
            const term = searchTerm.toLowerCase();

            result = result.filter(p => {
                // 💡 جلب السّمية الكاملة من الـ profil ديال الـ user
                const studentName = p.user?.profil?.nom_complet || p.user?.profil?.name || p.user?.name || '';
                const projectTitle = p.titre || '';

                return (
                    projectTitle.toLowerCase().includes(term) ||
                    studentName.toLowerCase().includes(term)
                );
            });
        }

        // update filtered list
        setFilteredProjects(result);

    }, [statusFilter, searchTerm, projects]);

    // ================= ARCHIVE PROJECT =================
    const handleArchive = async (id) => {
        if (window.confirm("Voulez-vous archiver ce projet ?")) {
            try {
                await axios.put(`/admin/projects/${id}/archive`);

                // refresh list
                fetchProjects();

            } catch (error) {
                alert("Erreur lors de l'archivage");
            }
        }
    };

    // ================= DELETE PROJECT =================
    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous supprimer définitivement ce projet ?")) {
            try {
                await axios.delete(`/admin/projects/${id}`);

                // refresh list
                fetchProjects();

            } catch (error) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    // ================= LOADING =================
    if (loading) return (
        <div className="loader-container">
            <Loader2 className="animate-spin" size={40} color="#c9a84c" />
        </div>
    );

    // ================= UI =================
    return (
        <div className="projects-page">

            {/* HEADER */}
            <header className="projects-header">
                <h1 className="page-title">
                    Gestion des <span>Projets</span>
                </h1>

                {/* SEARCH + FILTER */}
                <div className="header-controls">

                    {/* SEARCH */}
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Titre ou étudiant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* FILTER */}
                    <div className="filter-box">
                        <Filter size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actif</option>
                            <option value="archived">Archivé</option>
                        </select>
                    </div>

                </div>
            </header>

            {/* TABLE */}
            <div className="table-container">
                <table className="projects-table">

                    {/* TABLE HEADER */}
                    <thead>
                        <tr>
                            <th>Projet</th>
                            <th>Étudiant</th>
                            <th>Votes</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody>

                        {/* IF PROJECTS EXIST */}
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <tr key={project.id}>

                                    {/* TITLE */}
                                    <td className="project-title-cell">
                                        {project.titre}
                                    </td>

                                    {/* USER NAME */}
                                    <td className="student-name">
                                        {project.user?.profil?.nom_complet || project.user?.profil?.name || project.user?.name || 'Utilisateur inconnu'}
                                    </td>

                                    {/* VOTES */}
                                    <td>
                                        <span className="vote-count">
                                            {project.nb_votes || 0}
                                        </span>
                                    </td>

                                    {/* STATUS */}
                                    <td>
                                        <span className={`status-badge ${project.status}`}>
                                            {project.status || 'unknown'}
                                        </span>
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="action-buttons">

                                        {/* ARCHIVE */}
                                        <button
                                            onClick={() => handleArchive(project.id)}
                                            title="Archiver"
                                        >
                                            <Archive size={20} className="icon-archive" />
                                        </button>

                                        {/* DELETE */}
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={20} className="icon-danger" />
                                        </button>

                                    </td>

                                </tr>
                            ))
                        ) : (

                            // EMPTY STATE
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                    Aucun projet trouvé.
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectsPage;
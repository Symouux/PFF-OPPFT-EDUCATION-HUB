import React, { useState, useEffect } from 'react';
import axios from "../../api/axios";
import { Trash2, Archive, ExternalLink, Search, Loader2, Award, Filter } from 'lucide-react';
import './ProjectsList.css';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/projects');
            const actualData = response.data?.data?.data || [];
            setProjects(actualData);
            setFilteredProjects(actualData);
        } catch (error) {
            console.error("Error fetching projects:", error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    useEffect(() => {
        let result = Array.isArray(projects) ? [...projects] : [];
        
        if (statusFilter !== 'all') {
            result = result.filter(p => p.status?.toLowerCase() === statusFilter.toLowerCase());
        }

        if (searchTerm) {
            result = result.filter(p => 
                p.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredProjects(result);
    }, [statusFilter, searchTerm, projects]);

    const handleArchive = async (id) => {
        if (window.confirm("Voulez-vous archiver ce projet ?")) {
            try {
                await axios.put(`/admin/projects/${id}/archive`);
                fetchProjects();
            } catch (error) { alert("Erreur lors de l'archivage"); }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous supprimer définitivement ce projet ?")) {
            try {
                await axios.delete(`/admin/projects/${id}`);
                fetchProjects();
            } catch (error) { alert("Erreur lors de la suppression"); }
        }
    };

    if (loading) return <div className="loader-container"><Loader2 className="animate-spin" size={40} /></div>;

    return (
        <div className="projects-page">
            <header className="projects-header">
                <h1 className="page-title">Gestion des <span>Projets</span></h1>
                <div className="header-controls">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Titre ou étudiant..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-box">
                        <Filter size={18} />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Tous les statuts</option>
                            {/* <option value="pending">En attente</option> */}
                            <option value="active">Actif</option>
                            <option value="archived">Archivé</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="table-container">
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>Projet</th>
                            <th>Étudiant</th>
                            <th>Votes</th>
                            <th>Status</th>
                            {/* <th>Winner</th> */}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project) => (
                            <tr key={project.id}>
                                <td className="project-title-cell">
                                    {project.titre}
                                </td>

                                <td className="student-name">
                                    {project.student ? project.student.name : 'Utilisateur inconnu'}
                                </td>

                                <td>
                                    <span className="vote-count">{project.nb_votes || 0}</span>
                                </td>

                                <td>
                                    <span className={`status-badge ${project.status}`}>
                                        {project.status}
                                    </span>
                                </td>

                                {/* <td>
                                    {project.estGagantMois ? <Award className="icon-winner" size={20} /> : "-"}
                                </td> */}

                                <td className="action-buttons">
                                    <button onClick={() => handleArchive(project.id)} title="Archiver">
                                        <Archive size={20} className="icon-archive" />
                                    </button>
                                    <button onClick={() => handleDelete(project.id)} title="Supprimer">
                                        <Trash2 size={20} className="icon-danger" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectsPage;
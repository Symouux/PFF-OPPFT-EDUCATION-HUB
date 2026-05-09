import React, { useEffect, useState } from 'react';
import axios from '../../api/axios'; 

import {
  Users, UserCheck, FolderKanban, Archive,
  Heart, Trophy, RefreshCcw, LayoutDashboard
} from 'lucide-react';

import {
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {

  const [data, setData] = useState({
    stats: {
      total_users: 0,
      total_students: 0,
      total_mentors: 0,
      total_projects: 0,
      active_projects: 0,
      archived_projects: 0,
      total_votes: 0,
    },

    projet_gagnant: null,

    top_projects: [],

    evolution_students: [],

    evolution_projects: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    setLoading(true); 

    const [dashboardRes, votesRes] = await Promise.all([
      axios.get('/admin/stats'),
      axios.get('/admin/votes')
    ]);

    const dashboardData = dashboardRes.data.data || dashboardRes.data;
    const votesData = votesRes.data.data || votesRes.data || [];

    const sortedProjects = [...votesData].sort((a, b) => b.total_votes - a.total_votes);

    const top5 = sortedProjects.slice(0, 5).map((vote) => ({
      name: `Projet ${vote.project_id}`,
      votes: vote.total_votes
    }));

    setData(prevState => ({
      ...prevState,
      stats: {
        total_users: dashboardData.total_users || 0,
        total_students: dashboardData.total_students || 0,
        total_mentors: dashboardData.total_mentors || 0,
        total_projects: dashboardData.total_projects || 0,
        active_projects: dashboardData.active_projects || 0,
        archived_projects: dashboardData.archived_projects || 0,
        total_votes: dashboardData.total_votes || 0,
      },
      projet_gagnant: dashboardData.projet_gagnant || null,
      top_projects: top5,
      evolution_students: [
        { month: 'Jan', count: 20 },
        { month: 'Feb', count: 60 },
        { month: 'Mar', count: 120 },
        { month: 'Apr', count: dashboardData.total_students || 0 }
      ],
    }));

  } catch (error) {
    console.error("Erreur Fetching Data:", error.response || error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="db-root">

      {/* ── Header ── */}
      <div className="db-header">
        <div>
          <h1 className="db-header__title">Dashboard Overview</h1>
          <p className="db-header__sub">
            Statistiques en temps réel via AdminController
          </p>
        </div>
      </div>

      {/* 1️⃣ Stat Cards */}
      <div className="db-stats">

        <div className="db-stat" style={{ borderLeftColor: 'var(--navy)' }}>
          <div>
            <p className="db-stat__label">Total Utilisateurs</p>
            <h3 className="db-stat__value">
              {data.stats.total_users}
            </h3>
          </div>

          <div
            className="db-stat__icon"
            style={{
              background: 'var(--gold-glow)',
              color: 'var(--navy)'
            }}
          >
            <Users size={20} />
          </div>
        </div>

        <div className="db-stat" style={{ borderLeftColor: 'var(--gold)' }}>
          <div>
            <p className="db-stat__label">Étudiants / Mentors</p>

            <h3 className="db-stat__value">
              {data.stats.total_students} / {data.stats.total_mentors}
            </h3>
          </div>

          <div
            className="db-stat__icon"
            style={{
              background: 'var(--gold-glow)',
              color: 'var(--gold)'
            }}
          >
            <UserCheck size={20} />
          </div>
        </div>

        <div className="db-stat" style={{ borderLeftColor: 'var(--success)' }}>
          <div>
            <p className="db-stat__label">
              Projets (Actifs / Arch.)
            </p>

            <h3 className="db-stat__value">
              {data.stats.active_projects} / {data.stats.archived_projects}
            </h3>
          </div>

          <div
            className="db-stat__icon"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--success)'
            }}
          >
            <FolderKanban size={20} />
          </div>
        </div>

        <div className="db-stat" style={{ borderLeftColor: 'var(--danger)' }}>
          <div>
            <p className="db-stat__label">Total Votes</p>

            <h3 className="db-stat__value">
              {data.stats.total_votes}
            </h3>
          </div>

          <div
            className="db-stat__icon"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger)'
            }}
          >
            <Heart size={20} />
          </div>
        </div>

      </div>

      {/* 2️⃣ Winner */}
      <div className="db-winner">

        <div className="db-winner__left">

          <Trophy size={35} color="var(--gold)" />

          <div>
            <p className="db-winner__eyebrow">
              Project of the Month
            </p>

            <h2 className="db-winner__title">
              {data.projet_gagnant?.titre || 'Aucun projet'}
            </h2>

            <p className="db-winner__meta">
              Votes : {data.projet_gagnant?.nb_votes || 0}
            </p>
          </div>

        </div>

        <div className="db-winner__badge">
          Status :
          {data.projet_gagnant?.estGagantMois
            ? ' Gagnant Official'
            : ' En lice'}
        </div>

      </div>

      {/* ── Charts & Lists ── */}
      <div className="db-row db-row--wide">

        {/* Chart */}
        <div className="db-chart">

          <div className="db-chart__head">
            <span className="db-chart__title">
              Evolution Étudiants
            </span>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.evolution_students}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eee"
              />

              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip />

              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--navy)"
                fill="var(--gold-glow)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>

        </div>

        {/* Top Projects */}
        <div className="db-chart">

          <div className="db-chart__head">
            <span className="db-chart__title">
              Top 5 Projets (Votes)
            </span>
          </div>

          <div style={{ marginTop: '10px' }}>

            {data.top_projects.map((p, i) => (

              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <span style={{ fontSize: '13px' }}>
                  {p.name}
                </span>

                <span
                  style={{
                    fontWeight: 'bold',
                    color: 'var(--gold)'
                  }}
                >
                  {p.votes}
                </span>
              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Actions */}
      {/* 4️⃣ Quick Actions Section */}
      <div className="db-chart" style={{ marginTop: '20px' }}>

        <div className="db-chart__head">
          <span className="db-chart__title">
            Actions Rapides (Admin)
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginTop: '20px'
        }}>

          {/* Reset */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#0f2442',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <RefreshCcw size={18} color="#c9a84c" />
            <span>Réinitialiser les Votes</span>
          </button>

          {/* Archive */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#0f2442',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Archive size={18} color="#c9a84c" />
            <span>Archiver les Projets</span>
          </button>

          {/* PDF */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px',
              backgroundColor: '#0f2442',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <LayoutDashboard size={18} color="#c9a84c" />
            <span>Générer Rapport PDF</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
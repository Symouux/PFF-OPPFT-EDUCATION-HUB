import React, { useEffect, useState } from 'react';
import axios from '../../api/axios'; 

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // 👈 استيرادها كدالة مستقلة
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

  // 1️⃣ الدالة الأولى: جلب البيانات
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

  // 2️⃣ الدالة الثانية: الأرشفة
  const handleMonthlyArchive = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir archiver les projets du mois dernier et désigner le gagnant ?")) {
      try {
        setLoading(true);
        const response = await axios.post('/admin/admin/projects/archive-monthly');
        
        alert(response.data.message);
        
        await fetchDashboardData();
      } catch (error) {
        console.error("Erreur lors de l'archivage mensuel:", error);
        const errorMsg = error.response?.data?.message || error.message || "Une erreur est survenue";
        alert("Détails de l'erreur : " + errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  // 3️⃣ الدالة الثالثة: توليد الـ PDF (مكانها الصحيح دابا قبل الـ return والـ if)
  const generatePDFReport = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const navyColor = [15, 36, 66];    
      const goldColor = [201, 168, 76];  

      // Header د الـ Rapport
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text("OFPPT EDUCATION HUB", 14, 20);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120);
      doc.text("Rapport Mensuel d'Activité et Performance", 14, 26);
      
      const today = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      doc.text(`Date de génération : ${today}`, 145, 26);

      doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.setLineWidth(0.8);
      doc.line(14, 30, 196, 30);

      // 1. لوحة المؤشرات العامة (KPIs)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text("1. Indicateurs Globaux de la Plateforme", 14, 42);

      const stats = data?.stats || {};
      
      // 💡 التعديل هنا: عيطنا لـ autoTable كدالة وعطيناها الـ doc هو الأول
      autoTable(doc, {
        startY: 46,
        head: [['Indicateur Statistique', 'Valeur Actuelle']],
        body: [
          ['Total des Utilisateurs Inscrits', stats.total_users || 0],
          ['Nombre d\'Étudiants', stats.total_students || 0],
          ['Nombre de Mentors', stats.total_mentors || 0],
          ['Projets Actifs (Ce mois)', stats.active_projects || 0],
          ['Projets Archivés', stats.archived_projects || 0],
          ['Total des Votes Exprimés', stats.total_votes || 0],
        ],
        headStyles: { fillColor: navyColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { font: 'helvetica', fontSize: 10 },
        theme: 'striped',
        margin: { left: 14, right: 14 }
      });

      // 2. المشروع البطل
      // 💡 التعديل هنا: doc.lastAutoTable رجعات doc.previousAutoTable
      let currentY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 15 : 120;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("2. Projet Gagnant du Mois (Project of the Month)", 14, currentY);

      if (data && data.projet_gagnant) {
        doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
        doc.setFillColor(250, 248, 242); 
        doc.rect(14, currentY + 4, 182, 30, 'FD');

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text(`🏆 ${data.projet_gagnant.titre || 'Sans Titre'}`, 18, currentY + 12);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        doc.text(`Développé par : ${data.projet_gagnant.user?.profil?.nom_complet || 'Étudiant'}`, 18, currentY + 20);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
        doc.text(`Score Global Réalisé : ${data.projet_gagnant.global_score || 0} Points`, 18, currentY + 27);
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150);
        doc.text("Aucun projet n'a encore été désigné comme gagnant pour cette période.", 14, currentY + 10);
      }

      // 3. جدول الصدارة
      currentY = data && data.projet_gagnant ? currentY + 45 : currentY + 25;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text("3. Top 5 des Projets les Plus Votés", 14, currentY);

      const topProjects = data?.top_projects || [];
      const tableBody = topProjects.length > 0 
        ? topProjects.map((p, index) => [`#${index + 1}`, p?.name || 'Projet', `${p?.votes || 0} Votes`])
        : [['-', 'Aucun projet voté pour le moment', '0']];

      // 💡 التعديل هنا أيضاً: استخدام autoTable(doc, ...)
      autoTable(doc, {
        startY: currentY + 4,
        head: [['Rang', 'Nom du Projet', 'Nombre de Votes']],
        body: tableBody,
        headStyles: { fillColor: navyColor, textColor: [255, 255, 255] },
        styles: { font: 'helvetica', fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 20 },
          2: { cellWidth: 40, fontStyle: 'bold', textColor: goldColor }
        },
        theme: 'grid',
        margin: { left: 14, right: 14 }
      });

      // Footer د الـ صفحة
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150);
        doc.text("Document confidentiel - Administration OFPPT Education Hub", 14, 285);
        doc.text(`Page ${i} sur ${pageCount}`, 180, 285);
      }

      doc.save(`Rapport_Mensuel_${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (err) {
      console.error("Erreur PDF Generation:", err);
      alert("Erreur lors de la génération du PDF: " + err.message);
    }
  };

  // الـ Guards والـ Return د الـ Component
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
              {data.projet_gagnant?.titre || 'Aucun projet gagnant'}
            </h2>

            {data.projet_gagnant && (
              <p className="db-winner__meta">
                Par : <strong style={{ color: 'white' }}>{data.projet_gagnant.user?.profil?.nom_complet || 'Étudiant'}</strong> 
                <span style={{ margin: '0 10px' }}>|</span> 
                Score Global : <strong style={{ color: 'var(--gold)' }}>{data.projet_gagnant.global_score || 0} pts</strong>
              </p>
            )}
          </div>
        </div>

        <div className="db-winner__badge">
          Status : {data.projet_gagnant?.estGagantMois ? ' Gagnant Officiel' : ' En lice'}
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
                <span style={{ fontSize: '13px' }}>{p.name}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--gold)' }}>{p.votes}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

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

          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            padding: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0',
            borderRadius: '8px', color: '#0f2442', cursor: 'pointer', fontWeight: '600'
          }}>
            <RefreshCcw size={18} color="#c9a84c" />
            <span>Réinitialiser les Votes</span>
          </button>

          <button
            onClick={handleMonthlyArchive}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0',
              borderRadius: '8px', color: '#0f2442', cursor: 'pointer', fontWeight: '600'
            }}
          >
            <Archive size={18} color="#c9a84c" />
            <span>Archiver les Projets</span>
          </button>

          {/* PDF Button */}
          <button
            onClick={generatePDFReport} 
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
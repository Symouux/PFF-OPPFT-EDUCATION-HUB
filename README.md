# 🎓 OFPPT Education Hub

**Plateforme Collaborative de Travail et de Mentorat Académique**

Une application web full-stack connectant **étudiants**, **mentors** et **administrateurs** autour des projets académiques. Les étudiants publient leurs projets, reçoivent des évaluations détaillées, échangent avec des mentors, et participent à un système de vote communautaire.

---

## 📋 Table des matières

- [Architecture](#architecture)
- [Stack Technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
  - [Étudiant](#-étudiant)
  - [Mentor](#-mentor)
  - [Administrateur](#-administrateur)
- [Structure du Projet](#structure-du-projet)
- [Installation](#installation)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API REST](#api-rest)
- [Base de Données](#base-de-données)
- [Tests](#tests)
- [CI/CD](#cicd)
- [Équipe](#équipe)

---

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Frontend      │◄───►│    Backend      │◄───►│  Base de     │
│   React 19      │     │   Laravel 12    │     │  Données     │
│   + Vite 8      │     │   API REST      │     │  MySQL       │
│   + Axios       │     │   JWT Auth      │     │  / SQLite    │
└─────────────────┘     └─────────────────┘     └──────────────┘
        │                       │                       │
    Interface             Logique métier           Persistance
    utilisateur           Contrôleurs              Migrations
    Navigation            Middlewares              Relations
    État (context)        Modèles Eloquent         Contraintes
```

- **Frontend** : SPA React avec React Router, Axios pour la communication API
- **Backend** : API REST Laravel avec authentification JWT, middlewares de rôle
- **Base de données** : MySQL en production, SQLite en mémoire pour les tests
- **Sécurité** : RBAC (4 rôles), CSRF désactivé sur API, mots de passe hashés (bcrypt)

---

## 🛠 Stack Technique

### Frontend
| Technologie | Utilisation |
|---|---|
| **React 19** | Construction des interfaces utilisateur |
| **React Router** | Navigation et routes protégées par rôle |
| **Axios** | Communication avec l'API Laravel |
| **Vite 8** | Build tool et dev server |
| **CSS** | Styles spécifiques par module (Student, Mentor, Admin) |
| **Recharts** | Graphiques (dashboard mentor, admin) |

### Backend
| Technologie | Utilisation |
|---|---|
| **Laravel 12** | Framework backend API REST |
| **PHP 8.4** | Langage backend |
| **JWT Auth** | Authentification sans état (tokens) |
| **Laravel Fortify** | Réinitialisation des mots de passe |
| **Maatwebsite Excel** | Import utilisateurs depuis Excel/CSV |
| **PHPUnit 12** | Tests automatisés |
| **Laravel Pint** | Style du code PHP |

### DevOps
| Outil | Utilisation |
|---|---|
| **Git / GitHub** | Versioning, collaboration, branches |
| **GitHub Actions** | Intégration continue (tests auto) |
| **SonarQube** | Analyse statique du code |
| **Composer** | Gestion des dépendances PHP |
| **npm** | Gestion des dépendances JS |

---

## ✨ Fonctionnalités

### 👨‍🎓 Étudiant

| Fonctionnalité | Description |
|---|---|
| **Dashboard social** | Fil d'actualité avec tous les projets, filtres par catégorie, recherche |
| **Gestion de projets** | CRUD complet (créer, lire, modifier, supprimer) avec validation de liens GitHub/Drive |
| **Vote communautaire** | Vote pour les projets des autres étudiants (anti-doublon, pas d'auto-vote) |
| **Annuaires mentors** | Parcourir les mentors, voir leur disponibilité et spécialité |
| **Demandes de mentorat** | Envoyer une demande liée à un projet avec validation métier (catégorie, disponibilité) |
| **Notifications d'évaluation** | Recevoir les scores détaillés (5 critères) et commentaires des mentors |
| **Messagerie** | Chat avec les mentors, création de conversation, indicateurs de lecture |
| **Ressources partagées** | Consulter et partager des documents Google Drive avec aperçu intégré |
| **Classement** | Podium Top 3 + tableau complet classé par votes |
| **Profil** | Modifier ses informations personnelles, voir ses statistiques |

### 👨‍🏫 Mentor

| Fonctionnalité | Description |
|---|---|
| **Tableau de bord** | Statistiques : demandes, évaluations, projets gagnants + graphique d'évolution |
| **Demandes de mentorat** | Liste des demandes entrantes, accepter/refuser, marquer comme lu |
| **Projets acceptés** | Liste des projets à évaluer avec statut |
| **Évaluation** | Notation sur 5 critères (code, UI/UX, innovation, performance, présentation) |
| **Historique** | Consultation de toutes les évaluations soumises |
| **Messagerie** | Communication avec les étudiants |
| **Profil** | Vue publique avec statistiques et avis |

### 👨‍💼 Administrateur

| Fonctionnalité | Description |
|---|---|
| **Dashboard** | Statistiques globales : utilisateurs, projets, votes, projet gagnant du mois |
| **Gestion utilisateurs** | Lister, rechercher, filtrer, bloquer/débloquer, supprimer |
| **Import Excel/CSV** | Importer des utilisateurs en masse avec template + création auto des profils |
| **Gestion projets** | Lister, archiver, supprimer des projets |
| **Gestion votes** | Statistiques des votes, réinitialisation |
| **Gestion ressources** | Lister et supprimer des ressources |
| **Rapports** | Génération de rapports globaux |

---

## 📁 Structure du Projet

```
ofppt-education-hub/
├── ofppt-education-hub-backend/     # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AdminController.php
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── ProjectController.php
│   │   │   │   ├── ResourceController.php
│   │   │   │   ├── PreviewController.php
│   │   │   │   ├── Chat/
│   │   │   │   │   ├── ConversationController.php
│   │   │   │   │   └── MessageController.php
│   │   │   │   ├── Mentor/
│   │   │   │   │   ├── MentorProfileController.php
│   │   │   │   │   ├── MentorDashboardController.php
│   │   │   │   │   ├── MentorRequestController.php
│   │   │   │   │   └── MentorReviewController.php
│   │   │   │   └── Student/
│   │   │   │       ├── StudentMentorRequestController.php
│   │   │   │       ├── StudentVoteController.php
│   │   │   │       └── StudentNotificationController.php
│   │   │   └── Middleware/
│   │   │       ├── IsAdmin.php
│   │   │       ├── IsMentor.php
│   │   │       ├── IsStudent.php
│   │   │       └── IsPublisher.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Profil.php
│   │       ├── Categorie.php
│   │       ├── Project.php
│   │       ├── Vote.php
│   │       ├── MentorProfile.php
│   │       ├── MentorReview.php
│   │       ├── ProjectMentorRequest.php
│   │       ├── Resource.php
│   │       ├── Conversation.php
│   │       └── Message.php
│   ├── database/
│   │   ├── migrations/          (16 fichiers)
│   │   ├── seeders/
│   │   │   ├── DatabaseSeeder.php
│   │   │   ├── ProjectSeeder.php
│   │   │   └── TestSeeder.php
│   │   └── factories/
│   │       ├── UserFactory.php
│   │       ├── ProfilFactory.php
│   │       ├── ProjectFactory.php
│   │       ├── VoteFactory.php
│   │       └── ResourceFactory.php
│   ├── routes/
│   │   ├── api.php
│   │   └── api/Admin.php
│   └── tests/
│       ├── Feature/
│       │   ├── AdminFeatureTest.php
│       │   ├── AuthFeatureTest.php
│       │   ├── ChatFeatureTest.php
│       │   ├── MentorFeatureTest.php
│       │   ├── PasswordResetTest.php
│       │   ├── ProjectFeatureTest.php
│       │   ├── ResourceAndPreviewFeatureTest.php
│       │   └── StudentFeatureTest.php
│       └── Unit/
│           └── ExampleTest.php
│
├── ofppt-education-hub-frontend/     # Application React
│   └── src/
│       ├── api/
│       │   ├── axios.js
│       │   ├── studentApi.js
│       │   └── mentorApi.js
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   └── Icons.jsx
│       └── pages/
│           ├── Home/
│           ├── Auth/
│           ├── Student/      (9 pages)
│           ├── Mentor/       (8 pages)
│           └── Admin/        (5 pages)
│
├── PFF.tex                    # Rapport LaTeX
└── .github/workflows/ci.yml   # CI pipeline
```

---

## 🚀 Installation

### Prérequis
- PHP 8.3+
- Composer
- Node.js 20+
- MySQL (optionnel, SQLite pour dev)

### Backend

```bash
cd ofppt-education-hub-backend

# Installer les dépendances
composer install

# Configuration
cp .env.example .env
php artisan key:generate

# Base de données (SQLite par défaut)
touch database/database.sqlite
php artisan migrate

# Seeders
php artisan db:seed --class=TestSeeder
# ou
php artisan db:seed --class=ProjectSeeder

# Lancer le serveur
php artisan serve
```

### Frontend

```bash
cd ofppt-education-hub-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

---

## 🌐 API REST

### Routes publiques
| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Inscription |
| POST | `/api/login` | Connexion |
| GET | `/api/ping` | Health check |

### Routes authentifiées (auth:api)
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/me` | Profil connecté |
| POST | `/api/logout` | Déconnexion |
| PUT | `/api/profile` | Modifier profil |

### Routes étudiant (middleware: etudiant)
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/mentors` | Liste des mentors |
| POST | `/api/mentor_requests` | Envoyer demande mentorat |
| GET | `/api/mentor_requests` | Mes demandes |
| POST | `/api/projects/{id}/vote` | Voter pour un projet |
| GET | `/api/student/notifications` | Notifications évaluations |
| PUT | `/api/student/notifications/read` | Marquer notifications lues |

### Routes publisher (middleware: publisher)
| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/projects` | Créer projet |
| PUT | `/api/projects/{id}` | Modifier projet |
| DELETE | `/api/projects/{id}` | Supprimer projet |
| POST | `/api/resources` | Partager ressource |
| POST | `/api/previews/github` | Preview GitHub |
| POST | `/api/previews/drive` | Preview Drive |

### Routes mentor (middleware: mentor)
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/mentor/profile` | Profil mentor |
| GET | `/api/mentor/dashboard/statistics` | Stats dashboard |
| GET | `/api/mentor/dashboard/chart` | Données graphique |
| GET | `/api/mentor/requests` | Demandes entrantes |
| PUT | `/api/mentor/notifications/read` | Marquer lues |
| PUT | `/api/mentor/request/{id}/accept` | Accepter demande |
| PUT | `/api/mentor/request/{id}/reject` | Refuser demande |
| GET | `/api/mentor/accepted-projects` | Projets acceptés |
| POST | `/api/mentor/review` | Évaluer projet |
| GET | `/api/mentor/reviews` | Mes évaluations |

### Routes admin (middleware: admin)
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | Liste utilisateurs |
| PUT | `/api/admin/users/{id}/block` | Bloquer/débloquer |
| DELETE | `/api/admin/users/{id}` | Supprimer utilisateur |
| POST | `/api/admin/users/import` | Import Excel/CSV |
| GET | `/api/admin/users/import/template` | Template import |
| GET | `/api/admin/projects` | Tous les projets |
| PUT | `/api/admin/projects/{id}/archive` | Archiver projet |
| DELETE | `/api/admin/projects/{id}` | Supprimer projet |
| GET | `/api/admin/votes` | Stats votes |
| POST | `/api/admin/votes/{id}/reset` | Réinitialiser votes |
| GET | `/api/admin/stats` | Statistiques dashboard |
| GET | `/api/admin/resources` | Toutes les ressources |
| DELETE | `/api/admin/resources/{id}` | Supprimer ressource |

### Routes messagerie (auth:api)
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/conversations` | Mes conversations |
| POST | `/api/conversations` | Créer conversation |
| GET | `/api/messages/{conversationId}` | Messages d'une conversation |
| POST | `/api/messages` | Envoyer message |
| PUT | `/api/messages/read/{conversationId}` | Marquer messages lus |
| GET | `/api/messages/unread/count` | Nombre messages non lus |

### Routes publiques
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | Tous les projets |
| GET | `/api/projects/{id}` | Détail projet |
| GET | `/api/categories` | Catégories |
| GET | `/api/resources` | Ressources |

---

## 🗄 Base de Données

### 11 Tables

| Table | Description |
|---|---|
| `users` | Comptes utilisateur (email, password, rôle, blocage) |
| `profils` | Informations personnelles (nom, bio, photo, réseaux, score) |
| `categories` | Catégories de projets / spécialités mentors |
| `projects` | Projets (titre, description, technos, lien, votes, score) |
| `votes` | Votes (unique par couple utilisateur+projet) |
| `mentor_profiles` | Profils mentor (disponibilité, catégorie) |
| `mentor_reviews` | Évaluations détaillées (5 critères /5, commentaire, score final) |
| `project_mentor_requests` | Demandes de mentorat (statut : pending/accepted/rejected) |
| `resources` | Ressources partagées (liens Google Drive) |
| `conversations` | Conversations entre 2 utilisateurs |
| `messages` | Messages dans une conversation |

### Contraintes d'unicité
- `votes` : unique (utilisateur_id, project_id)
- `mentor_reviews` : unique (mentor_id, project_id)
- `project_mentor_requests` : unique (project_id, etudiant_id, mentor_id)
- `conversations` : unique (user_one, user_two)

---

## 🧪 Tests

**37 tests — 138 assertions — 100% vert**

| Domaine | Fichier | Nb tests |
|---|---|---|
| Authentification | `AuthFeatureTest.php` | 5 |
| Administration | `AdminFeatureTest.php` | 5 |
| Projets | `ProjectFeatureTest.php` | 5 |
| Mentorat | `MentorFeatureTest.php` | 5 |
| Votes étudiants | `StudentFeatureTest.php` | 5 |
| Messagerie | `ChatFeatureTest.php` | 4 |
| Ressources/Preview | `ResourceAndPreviewFeatureTest.php` | 4 |
| Reset password | `PasswordResetTest.php` | 2 |
| Unitaires | `ExampleTest.php` | 2 |

```bash
php artisan test
```

---

## 🔄 CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) :

- **Déclenché sur** : push et pull request vers `develop` / `main`
- **Environnement** : Ubuntu latest, PHP 8.4, SQLite
- **Étapes** : Checkout → Setup PHP → Cache Composer → Install → Key generate → Run tests
- **Base de données** : SQLite en mémoire (`:memory:`)

---

## 👥 Équipe

| Membre | Rôle |
|---|---|
| **Khaoula ET-TAHERI** | Développeuse Full Stack |
| **Mohamed EL ANANI** | Développeur Full Stack |
| **Mohamed BENAMARA** | Développeur Full Stack |
| **Othmane ENNAHASS** | Développeur Full Stack |
| **M. Najib AMOURI** | Encadrant pédagogique |

---

## 📄 Licence

Projet réalisé dans le cadre de la formation **Développement Digital option Full Stack** à l'**ISTA NTIC SYBA** — OFPPT — Année 2025-2026.

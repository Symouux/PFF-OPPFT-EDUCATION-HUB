<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Web Application',
            'Mobile Application',
            'Desktop Application',
            'Data Science',
            'DevOps & Cloud',
        ];

        foreach ($categories as $name) {
            Categorie::firstOrCreate(['name' => $name]);
        }

        $projectsData = [
            // User ID 1 — 5 projects
            ['utilisateur_id' => 1, 'category_id' => 1, 'titre' => 'E-Commerce Platform',                  'description' => 'Plateforme e-commerce complète avec panier, paiement Stripe et tableau de bord admin.',                                        'technologies' => 'Laravel, React, MySQL, Stripe',                         'lienGithub' => 'https://github.com/student1/ecommerce-platform',          'nb_votes' => 12, 'global_score' => 85.5],
            ['utilisateur_id' => 1, 'category_id' => 2, 'titre' => 'Delivery Tracking App',              'description' => 'Application mobile de suivi de livraisons en temps réel avec notifications push et géolocalisation.',                            'technologies' => 'Flutter, Firebase, Google Maps API',                    'lienGithub' => 'https://github.com/student1/delivery-tracker',           'nb_votes' => 8,  'global_score' => 72.0],
            ['utilisateur_id' => 1, 'category_id' => 3, 'titre' => 'Inventory Management System',        'description' => 'Logiciel de gestion de stock pour PME avec génération de rapports PDF et QR codes.',                                              'technologies' => 'C#, .NET, SQL Server',                                  'lienGithub' => 'https://github.com/student1/inventory-ms',               'nb_votes' => 5,  'global_score' => 68.0],
            ['utilisateur_id' => 1, 'category_id' => 4, 'titre' => 'Sales Prediction Dashboard',         'description' => 'Dashboard interactif de prédiction des ventes utilisant le machine learning (régression linéaire).',                                'technologies' => 'Python, Pandas, Scikit-learn, React',                   'lienGithub' => 'https://github.com/student1/sales-prediction',           'nb_votes' => 15, 'global_score' => 91.0],
            ['utilisateur_id' => 1, 'category_id' => 5, 'titre' => 'CI/CD Pipeline Automation',          'description' => 'Pipeline CI/CD complet avec GitHub Actions, Docker et déploiement automatisé sur AWS EC2.',                                        'technologies' => 'Docker, GitHub Actions, AWS, Bash',                     'lienGithub' => 'https://github.com/student1/cicd-pipeline',              'nb_votes' => 10, 'global_score' => 79.0],

            // User ID 4 — 5 projects
            ['utilisateur_id' => 4, 'category_id' => 1, 'titre' => 'Real-Time Chat Application',         'description' => 'Application de chat en temps réel avec WebSockets, authentification JWT et salon privés.',                                        'technologies' => 'Laravel, Vue.js, WebSockets, Redis',                    'lienGithub' => 'https://github.com/student4/realtime-chat',              'nb_votes' => 20, 'global_score' => 94.0],
            ['utilisateur_id' => 4, 'category_id' => 2, 'titre' => 'Fitness Tracker Mobile App',         'description' => 'Application mobile de suivi sportif avec comptage de pas, calories et plans d\'entraînement personnalisés.',                       'technologies' => 'React Native, Node.js, MongoDB',                        'lienGithub' => 'https://github.com/student4/fitness-tracker',            'nb_votes' => 14, 'global_score' => 87.0],
            ['utilisateur_id' => 4, 'category_id' => 3, 'titre' => 'Hospital Management System',         'description' => 'Système de gestion hospitalière : rendez-vous, dossiers patients, facturation et tableau de bord.',                                'technologies' => 'Java Spring Boot, Angular, PostgreSQL',                 'lienGithub' => 'https://github.com/student4/hospital-ms',                'nb_votes' => 7,  'global_score' => 74.5],
            ['utilisateur_id' => 4, 'category_id' => 4, 'titre' => 'Customer Segmentation ML Model',     'description' => 'Modèle de segmentation clientèle avec K-Means clustering et visualisation interactive des clusters.',                                'technologies' => 'Python, TensorFlow, Streamlit, Plotly',                 'lienGithub' => 'https://github.com/student4/customer-segmentation',      'nb_votes' => 18, 'global_score' => 89.5],
            ['utilisateur_id' => 4, 'category_id' => 5, 'titre' => 'Dockerized Microservices Architecture', 'description' => 'Architecture microservices complète avec Docker Compose, API Gateway et équilibrage de charge.',                                     'technologies' => 'Docker, Kubernetes, Node.js, Nginx',                    'lienGithub' => 'https://github.com/student4/microservices-arch',         'nb_votes' => 11, 'global_score' => 82.0],
        ];

        foreach ($projectsData as $data) {
            Project::firstOrCreate(
                ['titre' => $data['titre'], 'utilisateur_id' => $data['utilisateur_id']],
                [
                    'category_id'      => $data['category_id'],
                    'description'      => $data['description'],
                    'technologies'     => $data['technologies'],
                    'lienGithub'       => $data['lienGithub'],
                    'estGagantMois'    => false,
                    'status'           => 'active',
                    'nb_votes'         => $data['nb_votes'],
                    'global_score'     => $data['global_score'],
                    'date_publication' => now()->subDays(rand(1, 30)),
                ]
            );
        }

        $this->command->info('✅ 10 projets créés (5 pour user 1, 5 pour user 4).');
    }
}

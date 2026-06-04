<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profil;
use App\Models\Project;
use App\Models\MentorProfile;
use App\Models\ProjectMentorRequest;
use Illuminate\Support\Facades\Hash;

class TestSeeder extends Seeder
{
    public function run()
    {
        // 1 — Catégorie
        $category = Categorie::firstOrCreate(
            ['name' => 'Web Application']
        );

        // 2 — Étudiant
        $etudiant = User::firstOrCreate(
            ['email' => 'etudiant@test.com'],
            [
                'password'         => Hash::make('password'),
                'role'             => 'etudiant',
                'is_blocked'       => false,
                'date_inscription' => now(),
            ]
        );
        Profil::firstOrCreate(
            ['user_id' => $etudiant->id],
            ['nom_complet' => 'Ahmed Bennani', 'bio' => 'Étudiant dev web']
        );

        // 3 — Mentor
        $mentor = User::firstOrCreate(
            ['email' => 'Mentor@gmail.com'],
            [
                'password'         => Hash::make('pass123'),
                'role'             => 'mentor',
                'is_blocked'       => false,
                'date_inscription' => now(),
            ]
        );
        Profil::firstOrCreate(
            ['user_id' => $mentor->id],
            ['nom_complet' => 'Khaoula ET-Taheri', 'bio' => 'Senior mentor']
        );
        MentorProfile::firstOrCreate(
            ['mentor_id' => $mentor->id],
            ['category_id' => $category->id]
        );

        // 4 — Projet avec catégorie
        $project = Project::firstOrCreate(
            ['titre' => 'Quantum Dashboard'],
            [
                'utilisateur_id'   => $etudiant->id,
                'category_id'      => $category->id,
                'description'      => 'Dashboard analytics fullstack avec React et Laravel.',
                'technologies'     => 'React, Laravel, MySQL',
                'lienGithub'       => 'https://github.com/test/quantum-dashboard',
                'estGagantMois'    => false,
                'status'           => 'active',
                'nb_votes'         => 0,
                'global_score'     => 0,
                'date_publication' => now(),
            ]
        );

        // 5 — Demande pending
        ProjectMentorRequest::firstOrCreate(
            ['project_id' => $project->id, 'mentor_id' => $mentor->id],
            [
                'etudiant_id' => $etudiant->id,
                'status'      => 'pending',
                'is_read'     => false,
            ]
        );

        // 6 — Conversation mentor ↔ étudiant
        $userOne = min($mentor->id, $etudiant->id);
        $userTwo = max($mentor->id, $etudiant->id);

        $conversation = Conversation::firstOrCreate(
            ['user_one' => $userOne, 'user_two' => $userTwo]
        );

        // 7 — Messages de test
        $msgs = [
            ['sender' => $etudiant, 'text' => 'Bonjour ! Je voulais savoir si vous pouvez encadrer mon projet Quantum Dashboard.', 'read' => true],
            ['sender' => $mentor,   'text' => 'Bonjour Ahmed ! Oui bien sûr, j\'ai regardé votre projet, c\'est très intéressant.', 'read' => true],
            ['sender' => $etudiant, 'text' => 'Super ! Quand pouvez-vous faire la première revue de code ?', 'read' => true],
            ['sender' => $mentor,   'text' => 'Je peux regarder ça ce soir. Poussez votre code sur le repo GitHub d\'abord.', 'read' => true],
            ['sender' => $etudiant, 'text' => 'C\'est fait ! Le repo est à jour. Branche principale : feat/dashboard-v2', 'read' => false],
        ];

        foreach ($msgs as $i => $msg) {
            Message::firstOrCreate(
                [
                    'conversation_id' => $conversation->id,
                    'sender_id'       => $msg['sender']->id,
                    'message'         => $msg['text'],
                ],
                [
                    'is_read'    => $msg['read'],
                    'created_at' => now()->subMinutes(count($msgs) - $i),
                    'updated_at' => now()->subMinutes(count($msgs) - $i),
                ]
            );
        }

        $this->command->info('✅ Données de test créées.');
        $this->command->info('   Étudiant : etudiant@test.com  / password');
        $this->command->info('   Mentor   : Mentor@gmail.com   / pass123');
        $this->command->info('   Conversation + 5 messages créés.');
    }
}

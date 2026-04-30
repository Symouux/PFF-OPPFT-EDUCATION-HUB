<?php

namespace Database\Seeders;

use App\Models\Profil;
use App\Models\Project;
use App\Models\Resource;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. admin fixe
        $admin = User::create([
            'email' => 'admin@gmail.com',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'date_inscription' => now(),
            'is_blocked' => false,
        ]);

        Profil::factory()->create([
            'user_id' => $admin->id,
            'nom_complet' => 'Administrateur Principal',
            'score_mensuel' => 0,
            'lien_github' => null,
            'lien_linkedin' => null,
        ]);
        //2.users aleatoire

        $users = User::factory(20)->create();

        foreach ($users as $user) {

            // student
            if ($user->role === 'student') {

                Profil::factory()->create([
                    'user_id' => $user->id,
                    'nom_complet' => fake()->name(),
                    'score_mensuel' => rand(100, 1000),
                    'lien_github' => fake()->url(),
                    'lien_linkedin' => fake()->url(),
                ]);

                Project::factory(rand(1, 3))->create([
                    'student_id' => $user->id
                ]);
            }

            // mentor
            elseif ($user->role === 'mentor') {

                Profil::factory()->create([
                    'user_id' => $user->id,
                    'nom_complet' => fake()->name(),
                    'score_mensuel' => 0,
                    'lien_github' => null,
                    'lien_linkedin' => fake()->url(),
                ]);
            }

            // autre (admin)
            else {

                Profil::factory()->create([
                    'user_id' => $user->id,
                    'nom_complet' => fake()->name(),
                    'score_mensuel' => 0,
                    'lien_github' => null,
                    'lien_linkedin' => null,
                ]);
            }

            // ressource pour tout user

            Resource::create([
                'utilisateur_id' => $user->id,
                'titre' => fake()->sentence(3),
                'type' => fake()->randomElement(['pdf', 'video', 'link']),
                'url_fichier' => fake()->url(),

            ]);
        }


        //3. Vote sur les projet

        $projects = Project::all();

        foreach ($projects as $project) {

            // utilisateurs qui peuvent voter (pas le propriétaire)
            $voters = User::where('id', '!=', $project->student_id)
                ->where('role', 'student')
                ->inRandomOrder()
                ->take(rand(1, 10))
                ->get();

            foreach ($voters as $voter) {

                // éviter double vote
                $alreadyVoted = Vote::where('student_id', $voter->id)
                    ->where('project_id', $project->id)
                    ->exists();

                if (!$alreadyVoted) {
                    Vote::create([
                        'student_id' => $voter->id,
                        'project_id' => $project->id,
                        'date_vote'  => now(),
                    ]);
                }
            }

            // mise à jour nb_votes
            $project->update([
                'nb_votes' => $project->votes()->count()
            ]);
        }
    }
}

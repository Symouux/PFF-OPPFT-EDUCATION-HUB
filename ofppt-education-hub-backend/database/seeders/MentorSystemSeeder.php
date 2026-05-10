<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\User;
use App\Models\Profil;
use App\Models\Category;
use App\Models\Project;
use App\Models\MentorProfile;
use App\Models\ProjectMentorRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MentorSystemSeeder extends Seeder
{
    public function run()
    {
        // 1. Create a Category
        $category = Categorie::create(['name' => 'Web Development']);

        // 2. Create a Mentor
        $mentor = User::create([
            'email' => 'mentor@test.com',
            'password' => Hash::make('password'),
            'role' => 'mentor'
        ]);

        Profil::create([
            'user_id' => $mentor->id,
            'nom_complet' => 'Adnane Mentor',
            'score_mensuel' => 0
        ]);

        MentorProfile::create([
            'mentor_id' => $mentor->id,
            'category_id' => $category->id,
            'is_available' => true
        ]);

        // 3. Create a Student
        $student = User::create([
            'email' => 'student@test.com',
            'password' => Hash::make('password'),
            'role' => 'student'
        ]);

        Profil::create([
            'user_id' => $student->id,
            'nom_complet' => 'Amine Student',
            'score_mensuel' => 0
        ]);

        // 4. Create a Project
        $project = Project::create([
            'utilisateur_id' => $student->id, 
            'category_id'    => $category->id,
            'titre'          => 'E-commerce App',
            'description'    => 'A full stack web application project',
            'status'         => 'active',        
            'estGagantMois'  => false,           
            'nb_votes'       => 0,
            'date_publication' => now()
        ]);

        // 5. Create the Request
        ProjectMentorRequest::create([
            'project_id'  => $project->id,
            'etudiant_id' => $student->id,
            'mentor_id'   => $mentor->id,
            'status'      => 'pending' 
        ]);
    }
}
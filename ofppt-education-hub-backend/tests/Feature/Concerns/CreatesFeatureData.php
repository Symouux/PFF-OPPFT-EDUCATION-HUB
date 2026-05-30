<?php

namespace Tests\Feature\Concerns;

use App\Models\Categorie;
use App\Models\MentorProfile;
use App\Models\Profil;
use App\Models\Project;
use App\Models\ProjectMentorRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

trait CreatesFeatureData
{
    protected function createUser(string $role = 'etudiant', array $attributes = []): User
    {
        $user = User::create(array_merge([
            'email' => uniqid($role.'_').'@example.test',
            'password' => Hash::make('password123'),
            'role' => $role,
            'date_inscription' => now(),
            'is_blocked' => false,
        ], $attributes));

        Profil::create([
            'user_id' => $user->id,
            'nom_complet' => $attributes['nom_complet'] ?? ucfirst($role).' User',
            'bio' => null,
            'photo' => null,
            'lien_linkedin' => null,
            'lien_github' => null,
            'score_mensuel' => 0,
        ]);

        return $user;
    }

    protected function createCategory(array $attributes = []): Categorie
    {
        return Categorie::create(array_merge([
            'name' => uniqid('Category '),
        ], $attributes));
    }

    protected function createMentor(?Categorie $category = null, array $attributes = []): User
    {
        $mentor = $this->createUser('mentor', $attributes);

        MentorProfile::create([
            'mentor_id' => $mentor->id,
            'category_id' => ($category ?? $this->createCategory())->id,
            'is_available' => $attributes['is_available'] ?? true,
        ]);

        return $mentor;
    }

    protected function createProject(?User $owner = null, ?Categorie $category = null, array $attributes = []): Project
    {
        $owner ??= $this->createUser('etudiant');
        $category ??= $this->createCategory();

        return Project::create(array_merge([
            'utilisateur_id' => $owner->id,
            'category_id' => $category->id,
            'titre' => 'Student project',
            'description' => 'A useful project for students.',
            'technologies' => 'Laravel, React',
            'lienGithub' => 'https://github.com/example/project',
            'estGagantMois' => false,
            'status' => 'active',
            'nb_votes' => 0,
            'global_score' => 0,
            'date_publication' => now(),
        ], $attributes));
    }

    protected function createAcceptedMentorRequest(Project $project, User $mentor): ProjectMentorRequest
    {
        return ProjectMentorRequest::create([
            'project_id' => $project->id,
            'etudiant_id' => $project->utilisateur_id,
            'mentor_id' => $mentor->id,
            'status' => 'accepted',
            'is_read' => false,
        ]);
    }
}

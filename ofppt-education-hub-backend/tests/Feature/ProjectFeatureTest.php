<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CreatesFeatureData;
use Tests\TestCase;

class ProjectFeatureTest extends TestCase
{
    use CreatesFeatureData;
    use RefreshDatabase;

    public function test_publisher_can_create_project(): void
    {
        $student = $this->createUser('etudiant');
        $category = $this->createCategory(['name' => 'Web']);

        $response = $this->actingAs($student, 'api')->postJson('/api/projects', [
            'titre' => 'OFPPT Hub',
            'description' => 'A learning hub project.',
            'technologies' => 'Laravel, React',
            'lienGithub' => 'https://github.com/example/ofppt-hub',
            'category_id' => $category->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.titre', 'OFPPT Hub')
            ->assertJsonPath('data.utilisateur_id', $student->id);

        $this->assertDatabaseHas('projects', [
            'titre' => 'OFPPT Hub',
            'status' => 'active',
            'nb_votes' => 0,
        ]);
    }

    public function test_project_details_include_owner_profile_and_category(): void
    {
        $owner = $this->createUser('etudiant');
        $category = $this->createCategory(['name' => 'Mobile']);
        $project = $this->createProject($owner, $category, ['titre' => 'Mobile App']);

        $this->actingAs($owner, 'api')
            ->getJson("/api/projects/{$project->id}")
            ->assertOk()
            ->assertJsonPath('data.titre', 'Mobile App')
            ->assertJsonPath('data.user.profil.user_id', $owner->id)
            ->assertJsonPath('data.categories.name', 'Mobile');
    }

    public function test_project_owner_can_update_project(): void
    {
        $owner = $this->createUser('etudiant');
        $category = $this->createCategory();
        $project = $this->createProject($owner, $category);

        $this->actingAs($owner, 'api')->putJson("/api/projects/{$project->id}", [
            'titre' => 'Updated title',
            'description' => 'Updated description',
            'technologies' => 'Laravel',
            'lienGithub' => 'https://github.com/example/updated',
            'category_id' => $category->id,
        ])->assertOk()
            ->assertJsonPath('data.titre', 'Updated title');

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'titre' => 'Updated title',
        ]);
    }

    public function test_non_owner_cannot_update_or_delete_project(): void
    {
        $owner = $this->createUser('etudiant');
        $otherUser = $this->createUser('etudiant');
        $category = $this->createCategory();
        $project = $this->createProject($owner, $category);

        $this->actingAs($otherUser, 'api')->putJson("/api/projects/{$project->id}", [
            'titre' => 'Hijacked title',
            'description' => 'Should not update',
            'category_id' => $category->id,
        ])->assertForbidden();

        $this->actingAs($otherUser, 'api')
            ->deleteJson("/api/projects/{$project->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'titre' => $project->titre,
        ]);
    }

    public function test_project_owner_can_delete_project(): void
    {
        $owner = $this->createUser('etudiant');
        $project = $this->createProject($owner);

        $this->actingAs($owner, 'api')
            ->deleteJson("/api/projects/{$project->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Project deleted successfully !');

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Resource;
use App\Models\Vote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CreatesFeatureData;
use Tests\TestCase;

class AdminFeatureTest extends TestCase
{
    use CreatesFeatureData;
    use RefreshDatabase;

    public function test_admin_can_list_and_block_users(): void
    {
        $admin = $this->createUser('admin');
        $student = $this->createUser('etudiant');

        $this->actingAs($admin, 'api')
            ->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonFragment(['email' => $student->fresh()->email]);

        $this->actingAs($admin, 'api')
            ->putJson("/api/admin/users/{$student->id}/block")
            ->assertOk()
            ->assertJsonPath('data.is_blocked', true);

        $this->assertDatabaseHas('users', [
            'id' => $student->id,
            'is_blocked' => true,
        ]);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $student = $this->createUser('etudiant');

        $this->actingAs($student, 'api')
            ->getJson('/api/admin/stats')
            ->assertForbidden()
            ->assertJsonPath('message', 'Access Denied. Admins only.');
    }

    public function test_admin_can_archive_project_and_reset_votes(): void
    {
        $admin = $this->createUser('admin');
        $owner = $this->createUser('etudiant');
        $voter = $this->createUser('etudiant');
        $project = $this->createProject($owner, null, ['nb_votes' => 1]);

        Vote::create([
            'utilisateur_id' => $voter->id,
            'project_id' => $project->id,
            'date_vote' => now(),
        ]);

        $this->actingAs($admin, 'api')
            ->putJson("/api/admin/projects/{$project->id}/archive")
            ->assertOk()
            ->assertJsonPath('data.status', 'archived');

        $this->actingAs($admin, 'api')
            ->postJson("/api/admin/votes/{$project->id}/reset")
            ->assertOk();

        $this->assertDatabaseMissing('votes', ['project_id' => $project->id]);
        $this->assertEquals(0, $project->fresh()->nb_votes);
    }

    public function test_admin_dashboard_stats_counts_core_entities(): void
    {
        $admin = $this->createUser('admin');
        $student = $this->createUser('etudiant');
        $this->createMentor();
        $this->createProject($student);

        $this->actingAs($admin, 'api')
            ->getJson('/api/admin/stats')
            ->assertOk()
            ->assertJsonPath('data.total_users', 3)
            ->assertJsonPath('data.total_students', 1)
            ->assertJsonPath('data.total_mentors', 1)
            ->assertJsonPath('data.total_projects', 1);
    }

    public function test_admin_can_delete_resource(): void
    {
        $admin = $this->createUser('admin');
        $student = $this->createUser('etudiant');
        $resource = Resource::create([
            'utilisateur_id' => $student->id,
            'titre' => 'Shared doc',
            'type' => 'drive',
            'url_fichier' => 'https://drive.google.com/file/d/doc/view',
            'date_ajout' => now(),
        ]);

        $this->actingAs($admin, 'api')
            ->deleteJson("/api/admin/resources/{$resource->id}")
            ->assertOk();

        $this->assertDatabaseMissing('resources', ['id' => $resource->id]);
    }
}

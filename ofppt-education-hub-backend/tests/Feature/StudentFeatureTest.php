<?php

namespace Tests\Feature;

use App\Models\Vote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CreatesFeatureData;
use Tests\TestCase;

class StudentFeatureTest extends TestCase
{
    use CreatesFeatureData;
    use RefreshDatabase;

    public function test_student_can_vote_for_another_students_project_once(): void
    {
        $owner = $this->createUser('etudiant');
        $voter = $this->createUser('etudiant');
        $project = $this->createProject($owner);

        $this->actingAs($voter, 'api')
            ->postJson("/api/projects/{$project->id}/vote")
            ->assertCreated()
            ->assertJsonPath('data.utilisateur_id', $voter->id);

        $this->assertDatabaseHas('votes', [
            'utilisateur_id' => $voter->id,
            'project_id' => $project->id,
        ]);

        $this->assertEquals(1, $project->fresh()->nb_votes);

        $this->actingAs($voter, 'api')
            ->postJson("/api/projects/{$project->id}/vote")
            ->assertStatus(409)
            ->assertJsonPath('message', 'You already voted for this project !');
    }

    public function test_student_cannot_vote_for_own_project(): void
    {
        $owner = $this->createUser('etudiant');
        $project = $this->createProject($owner);

        $this->actingAs($owner, 'api')
            ->postJson("/api/projects/{$project->id}/vote")
            ->assertForbidden()
            ->assertJsonPath('message', 'You cannot vote for your own project');

        $this->assertEquals(0, Vote::count());
    }

    public function test_student_can_request_available_matching_mentor_for_own_project(): void
    {
        $category = $this->createCategory();
        $student = $this->createUser('etudiant');
        $mentor = $this->createMentor($category);
        $project = $this->createProject($student, $category);

        $this->actingAs($student, 'api')->postJson('/api/mentor_requests', [
            'project_id' => $project->id,
            'mentor_id' => $mentor->id,
        ])->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.mentor_id', $mentor->id);

        $this->assertDatabaseHas('project_mentor_requests', [
            'project_id' => $project->id,
            'etudiant_id' => $student->id,
            'mentor_id' => $mentor->id,
            'status' => 'pending',
        ]);
    }

    public function test_student_cannot_request_mentor_for_another_students_project(): void
    {
        $category = $this->createCategory();
        $owner = $this->createUser('etudiant');
        $student = $this->createUser('etudiant');
        $mentor = $this->createMentor($category);
        $project = $this->createProject($owner, $category);

        $this->actingAs($student, 'api')->postJson('/api/mentor_requests', [
            'project_id' => $project->id,
            'mentor_id' => $mentor->id,
        ])->assertForbidden()
            ->assertJsonPath('message', 'Forbidden');
    }

    public function test_student_can_list_their_mentor_requests(): void
    {
        $category = $this->createCategory();
        $student = $this->createUser('etudiant');
        $mentor = $this->createMentor($category);
        $project = $this->createProject($student, $category);

        $this->actingAs($student, 'api')->postJson('/api/mentor_requests', [
            'project_id' => $project->id,
            'mentor_id' => $mentor->id,
        ]);

        $this->actingAs($student, 'api')
            ->getJson('/api/mentor_requests')
            ->assertOk()
            ->assertJsonPath('data.0.project_id', $project->id)
            ->assertJsonPath('data.0.user_mentor.id', $mentor->id);
    }
}

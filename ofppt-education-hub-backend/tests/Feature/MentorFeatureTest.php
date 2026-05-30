<?php

namespace Tests\Feature;

use App\Models\ProjectMentorRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CreatesFeatureData;
use Tests\TestCase;

class MentorFeatureTest extends TestCase
{
    use CreatesFeatureData;
    use RefreshDatabase;

    public function test_mentor_can_list_and_accept_pending_requests(): void
    {
        $category = $this->createCategory();
        $student = $this->createUser('etudiant');
        $mentor = $this->createMentor($category);
        $project = $this->createProject($student, $category);

        $request = ProjectMentorRequest::create([
            'project_id' => $project->id,
            'etudiant_id' => $student->id,
            'mentor_id' => $mentor->id,
            'status' => 'pending',
            'is_read' => false,
        ]);

        $this->actingAs($mentor, 'api')
            ->getJson('/api/mentor/requests')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('notifications.0.id', $request->id);

        $this->actingAs($mentor, 'api')
            ->putJson("/api/mentor/request/{$request->id}/accept")
            ->assertOk()
            ->assertJsonPath('message', 'Request accepted successfully');

        $this->assertDatabaseHas('project_mentor_requests', [
            'id' => $request->id,
            'status' => 'accepted',
        ]);
    }

    public function test_mentor_can_reject_request_and_mark_notifications_as_read(): void
    {
        $category = $this->createCategory();
        $student = $this->createUser('etudiant');
        $mentor = $this->createMentor($category);
        $project = $this->createProject($student, $category);

        $request = ProjectMentorRequest::create([
            'project_id' => $project->id,
            'etudiant_id' => $student->id,
            'mentor_id' => $mentor->id,
            'status' => 'pending',
            'is_read' => false,
        ]);

        $this->actingAs($mentor, 'api')
            ->putJson('/api/mentor/notifications/read')
            ->assertOk();

        $this->assertDatabaseHas('project_mentor_requests', [
            'id' => $request->id,
            'is_read' => true,
        ]);

        $this->actingAs($mentor, 'api')
            ->putJson("/api/mentor/request/{$request->id}/reject")
            ->assertOk()
            ->assertJsonPath('message', 'Request rejected successfully');

        $this->assertDatabaseHas('project_mentor_requests', [
            'id' => $request->id,
            'status' => 'rejected',
        ]);
    }

    public function test_mentor_can_review_accepted_project_once_and_updates_global_score(): void
    {
        $category = $this->createCategory();
        $student = $this->createUser('etudiant');
        $mentor = $this->createMentor($category);
        $project = $this->createProject($student, $category, ['nb_votes' => 3]);
        $this->createAcceptedMentorRequest($project, $mentor);

        $payload = [
            'project_id' => $project->id,
            'code_quality' => 4,
            'ui_ux' => 5,
            'innovation' => 3,
            'performance' => 4,
            'presentation' => 5,
            'comment' => 'Strong work.',
        ];

        $this->actingAs($mentor, 'api')
            ->postJson('/api/mentor/review', $payload)
            ->assertCreated()
            ->assertJsonPath('final_score_calculated', 21);

        $this->assertDatabaseHas('mentor_reviews', [
            'mentor_id' => $mentor->id,
            'project_id' => $project->id,
            'final_score' => 21,
        ]);

        $this->assertEquals(24.0, (float) $project->fresh()->global_score);

        $this->actingAs($mentor, 'api')
            ->postJson('/api/mentor/review', $payload)
            ->assertStatus(400)
            ->assertJsonPath('message', 'You already reviewed this project');
    }

    public function test_mentor_cannot_review_without_accepted_request(): void
    {
        $category = $this->createCategory();
        $student = $this->createUser('etudiant');
        $mentor = $this->createMentor($category);
        $project = $this->createProject($student, $category);

        $this->actingAs($mentor, 'api')->postJson('/api/mentor/review', [
            'project_id' => $project->id,
            'code_quality' => 4,
            'ui_ux' => 4,
            'innovation' => 4,
            'performance' => 4,
            'presentation' => 4,
            'comment' => 'Looks good.',
        ])->assertForbidden()
            ->assertJsonPath('message', 'Unauthorized review');
    }

    public function test_mentor_dashboard_statistics_are_calculated(): void
    {
        $category = $this->createCategory();
        $student = $this->createUser('etudiant');
        $mentor = $this->createMentor($category);
        $acceptedProject = $this->createProject($student, $category);
        $rejectedProject = $this->createProject($student, $category);

        $this->createAcceptedMentorRequest($acceptedProject, $mentor);
        ProjectMentorRequest::create([
            'project_id' => $rejectedProject->id,
            'etudiant_id' => $student->id,
            'mentor_id' => $mentor->id,
            'status' => 'rejected',
            'is_read' => true,
        ]);

        $this->actingAs($mentor, 'api')->postJson('/api/mentor/review', [
            'project_id' => $acceptedProject->id,
            'code_quality' => 5,
            'ui_ux' => 5,
            'innovation' => 5,
            'performance' => 5,
            'presentation' => 5,
            'comment' => 'Excellent.',
        ]);

        $this->actingAs($mentor, 'api')
            ->getJson('/api/mentor/dashboard/statistics')
            ->assertOk()
            ->assertJsonPath('total_requests', 2)
            ->assertJsonPath('accepted_requests', 1)
            ->assertJsonPath('rejected_requests', 1)
            ->assertJsonPath('evaluated_projects', 1)
            ->assertJsonPath('not_evaluated_projects', 0);
    }
}

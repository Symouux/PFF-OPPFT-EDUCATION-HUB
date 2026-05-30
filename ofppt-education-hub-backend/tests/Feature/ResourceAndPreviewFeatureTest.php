<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CreatesFeatureData;
use Tests\TestCase;

class ResourceAndPreviewFeatureTest extends TestCase
{
    use CreatesFeatureData;
    use RefreshDatabase;

    public function test_publisher_can_share_google_drive_resource(): void
    {
        $mentor = $this->createMentor();

        $this->actingAs($mentor, 'api')->postJson('/api/resources', [
            'titre' => 'Laravel course',
            'type' => 'drive',
            'url_fichier' => 'https://drive.google.com/file/d/abc123/view',
        ])->assertCreated()
            ->assertJsonPath('data.titre', 'Laravel course')
            ->assertJsonPath('data.utilisateur_id', $mentor->id);

        $this->assertDatabaseHas('resources', [
            'titre' => 'Laravel course',
            'url_fichier' => 'https://drive.google.com/file/d/abc123/view',
        ]);
    }

    public function test_resource_rejects_non_drive_links(): void
    {
        $student = $this->createUser('etudiant');

        $this->actingAs($student, 'api')->postJson('/api/resources', [
            'titre' => 'External resource',
            'url_fichier' => 'https://example.com/file.pdf',
        ])->assertStatus(422)
            ->assertJsonPath('message', 'Resource must be a Google Drive link');
    }

    public function test_drive_preview_parses_file_url(): void
    {
        $student = $this->createUser('etudiant');

        $this->actingAs($student, 'api')->postJson('/api/previews/drive', [
            'url' => 'https://drive.google.com/file/d/file-123/view',
        ])->assertOk()
            ->assertJsonPath('provider', 'drive')
            ->assertJsonPath('file_id', 'file-123')
            ->assertJsonPath('embed_url', 'https://drive.google.com/file/d/file-123/preview');
    }

    public function test_drive_preview_rejects_non_drive_url(): void
    {
        $student = $this->createUser('etudiant');

        $this->actingAs($student, 'api')->postJson('/api/previews/drive', [
            'url' => 'https://example.com/file',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('url');
    }
}

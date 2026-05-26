<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CreatesFeatureData;
use Tests\TestCase;

class ChatFeatureTest extends TestCase
{
    use CreatesFeatureData;
    use RefreshDatabase;

    public function test_user_can_create_or_reopen_conversation_with_another_user(): void
    {
        $firstUser = $this->createUser('etudiant');
        $secondUser = $this->createUser('mentor');

        $firstResponse = $this->actingAs($firstUser, 'api')->postJson('/api/conversations', [
            'user_id' => $secondUser->id,
        ]);

        $firstResponse->assertOk()
            ->assertJsonPath('user_one', min($firstUser->id, $secondUser->id))
            ->assertJsonPath('user_two', max($firstUser->id, $secondUser->id));

        $secondResponse = $this->actingAs($secondUser, 'api')->postJson('/api/conversations', [
            'user_id' => $firstUser->id,
        ]);

        $secondResponse->assertOk()
            ->assertJsonPath('id', $firstResponse->json('id'));
    }

    public function test_user_cannot_create_conversation_with_self(): void
    {
        $user = $this->createUser('etudiant');

        $this->actingAs($user, 'api')->postJson('/api/conversations', [
            'user_id' => $user->id,
        ])->assertStatus(400)
            ->assertJsonPath('message', 'You cannot chat with yourself');
    }

    public function test_conversation_members_can_send_read_and_count_messages(): void
    {
        $sender = $this->createUser('etudiant');
        $receiver = $this->createUser('mentor');

        $conversationId = $this->actingAs($sender, 'api')->postJson('/api/conversations', [
            'user_id' => $receiver->id,
        ])->json('id');

        $this->actingAs($sender, 'api')->postJson('/api/messages', [
            'conversation_id' => $conversationId,
            'message' => 'Hello mentor.',
        ])->assertCreated()
            ->assertJsonPath('data.sender_id', $sender->id)
            ->assertJsonPath('data.is_read', false);

        $this->actingAs($receiver, 'api')
            ->getJson("/api/messages/{$conversationId}")
            ->assertOk()
            ->assertJsonPath('0.message', 'Hello mentor.');

        $this->actingAs($receiver, 'api')
            ->getJson('/api/messages/unread/count')
            ->assertOk()
            ->assertJsonPath('unread_count', 1);

        $this->actingAs($receiver, 'api')
            ->putJson("/api/messages/read/{$conversationId}")
            ->assertOk()
            ->assertJsonPath('message', 'Messages marked as read');

        $this->actingAs($receiver, 'api')
            ->getJson('/api/messages/unread/count')
            ->assertOk()
            ->assertJsonPath('unread_count', 0);
    }

    public function test_non_member_cannot_read_or_send_messages_in_conversation(): void
    {
        $sender = $this->createUser('etudiant');
        $receiver = $this->createUser('mentor');
        $outsider = $this->createUser('etudiant');

        $conversationId = $this->actingAs($sender, 'api')->postJson('/api/conversations', [
            'user_id' => $receiver->id,
        ])->json('id');

        $this->actingAs($outsider, 'api')
            ->getJson("/api/messages/{$conversationId}")
            ->assertNotFound();

        $this->actingAs($outsider, 'api')->postJson('/api/messages', [
            'conversation_id' => $conversationId,
            'message' => 'I should not be here.',
        ])->assertNotFound();
    }
}

<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\Feature\Concerns\CreatesFeatureData;
use Tests\TestCase;

class AuthFeatureTest extends TestCase
{
    use CreatesFeatureData;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['jwt.secret' => str_repeat('a', 32)]);
    }

    public function test_student_can_register_with_profile_data(): void
    {
        Storage::fake('public');

        $response = $this->post('/api/register', [
            'nom_complet' => 'Sara Student',
            'email' => 'sara@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'bio' => 'Learning web development.',
            'photo' => UploadedFile::fake()->image('profile.jpg'),
            'lien_linkedin' => 'https://linkedin.com/in/sara',
            'lien_github' => 'https://github.com/sara',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', 'sara@example.test')
            ->assertJsonPath('user.role', 'etudiant')
            ->assertJsonPath('user.profil.nom_complet', 'Sara Student');

        $this->assertDatabaseHas('users', [
            'email' => 'sara@example.test',
            'role' => 'etudiant',
        ]);

        $this->assertDatabaseHas('profils', [
            'nom_complet' => 'Sara Student',
            'lien_github' => 'https://github.com/sara',
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = $this->createUser('etudiant', ['email' => 'login@example.test']);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.test',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['email', 'role']])
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_blocked_user_cannot_login(): void
    {
        $this->createUser('etudiant', [
            'email' => 'blocked@example.test',
            'is_blocked' => true,
        ]);

        $this->postJson('/api/login', [
            'email' => 'blocked@example.test',
            'password' => 'password123',
        ])->assertForbidden()
            ->assertJsonPath('message', 'Your account is blocked');
    }

    public function test_authenticated_user_can_fetch_their_profile(): void
    {
        $user = $this->createUser('mentor');

        $this->actingAs($user, 'api')
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('profil.user_id', $user->id);
    }

    public function test_login_rejects_wrong_password(): void
    {
        $user = $this->createUser('etudiant', ['email' => 'wrong-password@example.test']);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'bad-password',
        ])->assertUnauthorized()
            ->assertJsonPath('message', 'Password Invalid !');

        $this->assertTrue(Hash::check('password123', $user->password));
    }
}

<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'password',
        'role',
        'date_inscription',
        'is_blocked'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    public $timestamps = false;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Virtual 'name' attribute for Jetstream compatibility
    public function getNameAttribute()
    {
        return $this->profil?->nom_complet ?? $this->email;
    }

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role
        ];
    }

    // Relationship
    public function profil()
    {
        return $this->hasOne(Profil::class, 'user_id');
    }

    // relation One To Many un etudiant peux publier plusieurs projets
    public function projects()
    {
        return $this->hasMany(Project::class, 'utilisateur_id');
    }

    //un etudiant peut voter plusieurs fois pour differente projet
    public function votes()
    {
        if ($this->role !== 'etudiant') {
            return null;
        }

        return $this->hasMany(Vote::class, 'utilisateur_id');
    }

    //un user(etudiant mentore) peut ajouter des ressource
    public function resources()
    {
        return $this->hasMany(Resource::class, 'utilisateur_id');
    }
}

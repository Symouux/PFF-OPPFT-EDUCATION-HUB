<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Utilisateur extends Authenticatable implements JWTSubject
{
    protected $table = 'utilisateurs';

    protected $fillable = [
        'email',
        'mot_de_passe',
        'role',
        'date_inscription'
    ];

    public $timestamps = false;

    protected $hidden = [
        'mot_de_passe'
    ];

    // For Login Password
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    // JWT Unique Id
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    // Extra Data Inside Token
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role
        ];
    }

    public function profil()
    {
        return $this->hasOne(Profil::class, 'utilisateur_id');
    }

}

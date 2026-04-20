<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory;
    protected $fillable = [
        'email',
        'password',
        'role',
        'date_inscription'
    ];

    public $timestamps = false;

    protected $hidden = [
        'password'
    ];

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
        return $this->hasOne(Profil::class, 'user_id');
    }

}

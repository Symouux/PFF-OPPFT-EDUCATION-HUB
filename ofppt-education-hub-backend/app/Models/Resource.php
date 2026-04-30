<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'utilisateur_id',
        'titre',
        'type',
        'url_fichier',
        'date_ajout',
    ];

    // Une ressource appartient à un user( mentor ou student)
    public function user()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }
}

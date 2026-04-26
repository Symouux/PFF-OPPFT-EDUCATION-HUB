<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'mentor_id',
        'titre',
        'type',
        'url_fichier',
        'date_ajout',
    ];

    // Une ressource appartient à un mentor (user)
    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }
}

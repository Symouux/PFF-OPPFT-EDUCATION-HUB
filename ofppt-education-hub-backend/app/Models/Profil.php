<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profil extends Model
{
    protected $table = 'profils';

    protected $fillable = [
        'utilisateur_id',
        'nom_complet',
        'bio',
        'photo',
        'lien_linkedin',
        'lien_github',
        'score_mensuel'
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }
}

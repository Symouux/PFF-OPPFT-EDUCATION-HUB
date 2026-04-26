<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profil extends Model
{
    protected $table = 'profils';

    protected $fillable = [
        'user_id',
        'nom_complet',
        'bio',
        'photo',
        'lien_linkedin',
        'lien_github',
        'score_mensuel'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

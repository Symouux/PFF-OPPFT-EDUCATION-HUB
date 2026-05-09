<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Profil extends Model
{
    use HasFactory;
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

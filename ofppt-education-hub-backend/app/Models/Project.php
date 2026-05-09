<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;

    public $timestamps = false;
    // On liste exactement les colonnes de ta migration
    protected $fillable = [
        'utilisateur_id',
        'titre',
        'description',
        'technologies',
        'lienGithub',
        'estGagantMois',
        'status',
        'nb_votes',
        'date_publication',
    ];

    // Cast automatique pour le boolean
    protected $casts = [
        'estGagantMois'    => 'boolean',
        'date_publication' => 'datetime',
    ];

    // Un projet appartient aà un étudiant
    public function user()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }

    // Un projet peut avoir plusieurs votes
    public function votes()
    {
        return $this->hasMany(Vote::class, 'project_id');
    }

    public function categories()
    {
        return $this->belongsTo(Categorie::class, 'category_id');
    }
}

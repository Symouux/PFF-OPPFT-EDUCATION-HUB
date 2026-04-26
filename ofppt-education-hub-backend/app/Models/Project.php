<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    public $timestamps = false;
    // On liste exactement les colonnes de ta migration
    protected $fillable = [
        'student_id',
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
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Un projet peut avoir plusieurs votes
    public function votes()
    {
        return $this->hasMany(Vote::class);
    }
}

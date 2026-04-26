<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{


    protected $fillable = [
        'utilisateur_id',
        'project_id',
        'date_vote',
    ];

    public $timestamps = false;

    // Un vote appartient à un projet
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Un vote appartient à un utilisateur
    public function user()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }
}

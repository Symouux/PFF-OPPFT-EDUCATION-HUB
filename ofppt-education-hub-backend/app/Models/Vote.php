<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    use HasFactory;
    protected $fillable = [
        'student_id',
        'project_id',
        'date_vote',
    ];

    public $timestamps = false;

    // Un vote appartient à un projet
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Un vote appartient à un utilisateur(etudiant)
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}

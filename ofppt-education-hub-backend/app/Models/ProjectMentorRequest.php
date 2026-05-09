<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMentorRequest extends Model
{
    protected $fillable = [
        'project_id',
        'etudiant_id',
        'mentor_id',
        'status'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function userStudent()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function userMentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }
}

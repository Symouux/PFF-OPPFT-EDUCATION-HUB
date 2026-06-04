<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MentorReview extends Model
{
    protected $fillable = [
        'mentor_id',
        'project_id',
        'code_quality',
        'ui_ux',
        'innovation',
        'performance',
        'presentation',
        'final_score',
        'comment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}

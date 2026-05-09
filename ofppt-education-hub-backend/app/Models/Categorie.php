<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    protected $fillable = [
        'name'
    ];

    public function projects() {
        return $this->hasMany(Project::class, 'category_id');
    }

    public function mentorProfiles() {
        return $this->hasMany(MentorProfile::class, 'category_id');
    }
}

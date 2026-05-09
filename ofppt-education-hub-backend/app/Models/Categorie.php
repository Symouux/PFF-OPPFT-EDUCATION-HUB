<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    protected $fillable = [
        'name'
    ];

    public function profil()
    {
        return $this->hasMany(Profil::class, 'category_id');
    }
}

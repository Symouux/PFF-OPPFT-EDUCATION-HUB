<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class ResourceFactory extends Factory
{
    public function definition(): array
    {
        $types = ['pdf', 'video', 'lien', 'document'];

        return [
            'utilisateur_id' => User::factory(),

            'titre' => fake()->sentence(3),

            'type' => fake()->randomElement($types),

            'url_fichier' => fake()->url(),

            'date_ajout' => fake()->dateTimeThisYear(),
        ];
    }
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProfilFactory extends Factory
{
    public function definition(): array
    {
        return [

            'nom_complet' => fake()->name(),

            'bio' => fake()->paragraph(),

            'photo' => fake()->imageUrl(),

            'lien_linkedin' => fake()->url(),

            'lien_github' => fake()->url(),

            'score_mensuel' => fake()->numberBetween(0, 1000),
        ];
    }
}

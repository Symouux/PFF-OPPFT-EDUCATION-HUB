<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [

            'titre' => fake()->sentence(3),

            'description' => fake()->paragraph(4),

            'technologies' => fake()->randomElement([
                'Laravel',
                'Laravel + VueJS',
                'PHP + MySQL',
                'ReactJS',
                'Python Tkinter',
                'JavaScript Bootstrap'
            ]),

            'lienGithub' => fake()->url(),

            // un seul gagnant sera choisi plus tard
            'estGagantMois' => false,

            'status' => fake()->randomElement([
                'active',
                'archived'
            ]),

            // sera recalculé avec les vrais votes
            'nb_votes' => 0,

            'date_publication' => now(),
        ];
    }
}

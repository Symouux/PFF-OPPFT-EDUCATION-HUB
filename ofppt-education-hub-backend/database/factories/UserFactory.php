<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),

            'password' => Hash::make('password123'),

            'role' => fake()->randomElement([
                'admin',
                'etudiant',
                'mentor'
            ]),

            'date_inscription' => now(),

            'is_blocked' => fake()->boolean(20),
            // 20% des users seront bloqués
        ];
    }
}

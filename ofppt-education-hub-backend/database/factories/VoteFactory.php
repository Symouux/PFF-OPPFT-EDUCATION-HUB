<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => User::where('role', 'student')->inRandomOrder()->first()->id,
            'project_id' => Project::inRandomOrder()->first()->id,
            'date_vote'  => now(),
        ];
    }
}

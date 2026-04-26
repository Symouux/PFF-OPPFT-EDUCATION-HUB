<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();

            // Quel étudiant a voté
            $table->foreignId('utilisateur_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            // Pour quel projet
            $table->foreignId('project_id')
                  ->constrained('projects')
                  ->onDelete('cascade');

            $table->timestamp('date_vote')->nullable();
            

            // Un user peut voter une seule fois par projet
            $table->unique(['utilisateur_id', 'project_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};

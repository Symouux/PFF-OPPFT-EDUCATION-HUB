<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            // L'étudiant qui a publié ce projet
            $table->foreignId('utilisateur_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->string('titre');
            $table->text('description');
            $table->string('technologies')->nullable();
            $table->string('lienGithub')->nullable();
            $table->boolean('estGagantMois');

            // active → en cours | archived → archivé par admin
            $table->enum('status', ['active', 'archived'])->default('active');

            // Nombre de votes calculé
            $table->integer('nb_votes')->default(0);

            $table->timestamp('date_publication')->nullable();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};

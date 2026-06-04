<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();

            // N'importe quel user peut partager une ressource
            // étudiant OU mentor
            $table->foreignId('utilisateur_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->string('titre');

            // pdf, video, lien, document...
            $table->string('type')->nullable();

            $table->string('url_fichier')->nullable();
            $table->timestamp('date_ajout')->nullable();
            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};

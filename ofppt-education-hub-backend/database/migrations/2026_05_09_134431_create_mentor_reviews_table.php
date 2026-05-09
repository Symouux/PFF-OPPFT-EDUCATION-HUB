<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mentor_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')
                ->constrained('users')
                ->onDelete('cascade');
            $table->foreignId('project_id')
                ->constrained('projects')
                ->onDelete('cascade');
            $table->integer('code_quality');
            $table->integer('ui_ux');
            $table->integer('innovation');
            $table->integer('performance');
            $table->integer('presentation');
            $table->integer('final_score');
            $table->text('comment');
            $table->unique(['mentor_id', 'project_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mentor_reviews');
    }
};

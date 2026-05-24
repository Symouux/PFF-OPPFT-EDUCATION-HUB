<?php
// Khaoula ET-Taheri

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;

// ============================================
// GESTION DES UTILISATEURS: admin peux avoir bloque ou suprimer n'import qui
// ============================================

Route::get('/users', [AdminController::class, 'getAllUsers']);
Route::put('/users/{id}/block', [AdminController::class, 'blockUser']);
Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
Route::get('/users/import/template', [AdminController::class, 'downloadImportTemplate']);
Route::post('/users/import', [AdminController::class, 'importUsers']);

// ============================================
// GESTION DES PROJETS : Admin peux voir, archiver, suprimer les projet
// ============================================

Route::get('/projects', [AdminController::class, 'getAllProjects']);
Route::put('/projects/{id}/archive', [AdminController::class, 'archiveProject']);
Route::delete('/projects/{id}', [AdminController::class, 'deleteProject']);

// ============================================
// GESTION DES VOTES : voir , renitialiser les votes
// ============================================

Route::get('/votes', [AdminController::class, 'getVoteStats']);
Route::post('/votes/{id}/reset', [AdminController::class, 'resetVotes']);

// ============================================
// STATISTIQUES DASHBOARD : vue global
// ============================================

Route::get('/stats', [AdminController::class, 'getDashboardStats']);

// ============================================
// GESTION DES RESSOURCES : voir, suprimer, les doc partager sur la pkateforme
// ============================================

Route::get('/resources', [AdminController::class, 'getAllResources']);
Route::delete('/resources/{id}', [AdminController::class, 'deleteResource']);

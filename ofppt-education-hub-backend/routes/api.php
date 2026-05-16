<?php

use App\Http\Controllers\PreviewController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ResourceController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Mentor\MentorDashboardController;
use App\Http\Controllers\Mentor\MentorRequestController;
use App\Http\Controllers\Mentor\MentorReviewController;

//  Route de test public
Route::get('/ping', function () {
    return response()->json(['message' => 'API is working!'], 200);
});

//  Routes publiques (sans token)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Routes protégées (token obligatoire)
Route::middleware('auth:api')->group(function () {

    Route::get('/me',       [AuthController::class, 'me']);
    Route::post('/logout',  [AuthController::class, 'logout']);

    // Admin
    Route::middleware('admin')
        ->prefix('admin')
        ->group(base_path('routes/api/Admin.php'));


    // Etudiant
    Route::middleware('etudiant')->group(function () {
        Route::get('/student/test', function () {
            return response()->json(['message' => 'Welcome Student!']);
        });
    });

    Route::middleware('publisher')->group(function(){
        Route::post('/previews/github', [PreviewController::class, 'github']);
        Route::post('/previews/drive', [PreviewController::class, 'drive']);

        Route::post('/projects', [ProjectController::class, 'store']);
        Route::post('/resources', [ResourceController::class, 'store']);
    });




    // Mentor
    Route::middleware('mentor')->group(function () {

        // Mentor Statistiques

        Route::get('/mentor/dashboard/statistics', [MentorDashboardController::class, 'statistics']);

        // Mentor Requests

        Route::get('/mentor/requests', [MentorRequestController::class, 'index']);

        Route::put('/mentor/notifications/read', [MentorRequestController::class, 'markAsRead']);

        Route::put('/mentor/request/{id}/accept', [MentorRequestController::class, 'accept']);

        Route::put('/mentor/request/{id}/reject', [MentorRequestController::class, 'reject']);

        Route::get('/mentor/accepted-projects', [MentorRequestController::class, 'acceptedProjects']);


        // Mentor Reviews

        Route::post('/mentor/review', [MentorReviewController::class, 'store']);

        Route::get('/mentor/reviews', [MentorReviewController::class, 'myReviews']);

        Route::get('/mentor/review/{id}', [MentorReviewController::class, 'show']);
});
});

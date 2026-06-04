<?php

use App\Http\Controllers\PreviewController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\Student\StudentMentorRequestController;
use App\Http\Controllers\Student\StudentVoteController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Chat\ConversationController;
use App\Http\Controllers\Chat\MessageController;
use App\Http\Controllers\Mentor\MentorDashboardController;
use App\Http\Controllers\Mentor\MentorProfileController;
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

        Route::post('/mentor_requests', [StudentMentorRequestController::class, 'store']);
        Route::get('/mentor_requests', [StudentMentorRequestController::class, 'index']);

        Route::post('/projects/{id}/vote', [StudentVoteController::class, 'store']);
    });

    Route::middleware('publisher')->group(function () {
        Route::post('/previews/github', [PreviewController::class, 'github']);
        Route::post('/previews/drive', [PreviewController::class, 'drive']);

        Route::post('/projects', [ProjectController::class, 'store']);
        Route::put('/projects/{id}', [ProjectController::class, 'update']);
        Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

        Route::post('/resources', [ResourceController::class, 'store']);
    });


    // Conversations

    Route::get('/conversations', [ConversationController::class, 'index']);

    Route::post('/conversations', [ConversationController::class, 'store']);


    // Messages

    Route::get('/messages/{conversationId}', [MessageController::class, 'index']);

    Route::post('/messages', [MessageController::class, 'store']);

    Route::put('/messages/read/{conversationId}', [MessageController::class, 'markAsRead']);

    Route::get('/messages/unread/count', [MessageController::class, 'unreadCount']);

    // Projects Show
    Route::get('/projects/{id}', [ProjectController::class, 'show']);



    // Mentor
    Route::middleware('mentor')->group(function () {

        // Profile

        Route::get('/mentor/profile', [MentorProfileController::class, 'show']);

        // Mentor Statistiques

        Route::get('/mentor/dashboard/statistics', [MentorDashboardController::class, 'statistics']);
        Route::get('/mentor/dashboard/chart', [MentorDashboardController::class, 'chartData']);

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

<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/ping', function () {
    return response()->json(['message' => 'API is working!'], 200);
});


// Admin Group
Route::middleware(['auth:api', 'admin'])->group(function () {
    Route::get('/admin/test', function () {
        return response()->json(['message' => 'Welcome Admin! Middleware is working.']);
    });
});

// Mentor Group
Route::middleware(['auth:api', 'mentor'])->group(function () {
    Route::get('/mentor/test', function () {
        return response()->json(['message' => 'Welcome Mentor! Middleware is working.']);
    });
});

// Student Group
Route::middleware(['auth:api', 'etudiant'])->group(function () {
    Route::get('/student/test', function () {
        return response()->json(['message' => 'Welcome Student! Middleware is working.']);
    });
});



Route::get('/me', [AuthController::class, 'me']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/logout', [AuthController::class, 'logout']);

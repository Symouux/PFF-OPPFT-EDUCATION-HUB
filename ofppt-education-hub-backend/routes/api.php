<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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
    Route::middleware('admin')->group(function () {
        Route::get('/admin/test', function () {
            return response()->json(['message' => 'Welcome Admin!']);
        });
    });

    // Mentor
    Route::middleware('mentor')->group(function () {
        Route::get('/mentor/test', function () {
            return response()->json(['message' => 'Welcome Mentor!']);
        });
    });

    // Etudiant
    Route::middleware('etudiant')->group(function () {
        Route::get('/student/test', function () {
            return response()->json(['message' => 'Welcome Student!']);
        });
    });
});

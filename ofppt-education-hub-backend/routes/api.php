<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json(['message' => 'API is working!'], 200);
});


// Admin Group
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/test', function () {
        return response()->json(['message' => 'Welcome Admin! Middleware is working.']);
    });
});

// Mentor Group
Route::middleware(['auth:sanctum', 'mentor'])->group(function () {
    Route::get('/mentor/test', function () {
        return response()->json(['message' => 'Welcome Mentor! Middleware is working.']);
    });
});

// Student Group
Route::middleware(['auth:sanctum', 'etudiant'])->group(function () {
    Route::get('/student/test', function () {
        return response()->json(['message' => 'Welcome Student! Middleware is working.']);
    });
});
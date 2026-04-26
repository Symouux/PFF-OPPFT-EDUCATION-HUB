<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Your React frontend handles all UI routing. These web routes are reserved
| for internal Laravel features like Jetstream's password reset pages.
|
*/

Route::get('/', function () {
    return response()->json(['message' => 'OFPPT Education Hub API Backend'], 200);
});
